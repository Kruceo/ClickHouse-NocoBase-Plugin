import { ClickHouseClient } from "@clickhouse/client";
import { FindOptions, IModel, IRepository } from "@nocobase/data-source-manager"
import { generateWhereClause } from "./clickhouseUtils";

export class ClickhouseRepository implements IRepository {
  private ch: ClickHouseClient;
  private selectedTable: string;
  constructor(opt) {
    this.ch = opt.collectionManager.dataSource.ch
    this.selectedTable = opt.options.name
  }

  async find(options: { sort?: string[], offset: number, limit: number, filter: any }): Promise<IModel[]> {
    console.log("[CLICKHOUSE PL] find", options);

    const { limit, offset, sort, filter } = options
    console.log(JSON.stringify(filter["$and"]))

    const sortDirection = sort?.at(0)?.startsWith("-") ? "DESC" : "ASC"
    const query = `
      SELECT * FROM ${this.selectedTable} 
      WHERE ${generateWhereClause(filter)}
      ${sort ? `ORDER BY ${sort[0].replace("-", "")} ${sortDirection}` : ""}
      ${limit ? `LIMIT ${offset}, ${limit}` : ""}
    `

    console.log(query)

    const res = await this.ch.query({
      query: query,
      format: "JSON"
    })

    const data = await res.json<any>()
    const results = data.data.map((item) => ({
      ...item,
      toJSON() {
        return { ...item };
      }
    }));
    return results
  }

  async findOne(options?: any): Promise<IModel> {
    console.log("[CLICKHOUSE PL] find one", options)
    return {
      toJSON() {

      },
    }
  }

  async count(options?: any): Promise<Number> {
    console.log("[CLICKHOUSE PL] count")
    console.log(options)
    const res = await this.ch.query({
      query: `SELECT COUNT(*) as "total" FROM ${this.selectedTable}`,
      format: "JSON"
    })

    const d = await res.json<{ total: number }>()
    return d.data[0].total
  }

  async findAndCount(options: { filter: any, offset: number, limit: number }): Promise<[IModel[], number]> {
    const len = await this.count(options)
    const results = await this.find(options)
    return [results, len as number];
  }

  async create({ values }) {
    throw new Error("Not implemented")
  }

  async update({ filter, values }) {
    throw new Error("Not implemented")
  }

  async destroy({ filter }) {
    throw new Error("Not implemented")
  }
}

interface FilterOptions {
  "$and"?: {

  }[]
  "$or"?: {

  }[]
}

function generateWhereFromOptions(filter: FilterOptions) {
  const whereClauses: any[] = []
  if (filter["$and"]) {
    whereClauses.push(...parseConditions(filter["$and"]))
  }

  return whereClauses.reduce((acc, next) => " AND " + next + acc, "").slice(5)
}

function parseConditions(con: any[]) {
  const whereClauses: string[] = []
  for (const clause of con) {
    const key = Object.keys(clause)[0]
    let operator = Object.keys(clause[key])[0]
    const value = clause[key][operator]
    switch (operator) {
      case "$gt":
        operator = ">";
        break;
      case "$lt":
        operator = "<"; // Aqui estava "<=" no seu, mas o correto de $lt é "<"
        break;
      case "$lte":
        operator = "<="; // Aqui estava ">=" no seu, mas $lte é "menor ou igual"
        break;
      case "$gte":
        operator = ">=";
        break;
      case "$eq":
        operator = "=";
        break;
      case "$ne":
        operator = "!=";
        break;
      case "$empty":
        operator = "IS NULL";
        break;
      case "$notEmpty":
        operator = "IS NOT NULL";
        break;
      default:
        throw new Error(`Operador desconhecido: ${operator}`);
    }
    const outputClause = `${key} ${operator} ${typeof value != "boolean" ? value : ""}`
    whereClauses.push(outputClause)
  }
  return whereClauses
}