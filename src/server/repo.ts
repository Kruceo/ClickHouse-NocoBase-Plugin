import { ClickHouseClient } from "@clickhouse/client";
import { IModel, IRepository } from "@nocobase/data-source-manager"
import { generateWhereClause } from "./clickhouseUtils";

export class ClickhouseRepository implements IRepository {
  private ch: ClickHouseClient;
  private selectedTable: string;
  constructor(opt: { collectionManager: { dataSource: { ch: ClickHouseClient } }, options: { name: string } }) {
    this.ch = opt.collectionManager.dataSource.ch
    this.selectedTable = opt.options.name
  }

  // helpers
  generateQuery(options: QueryOptions) {
    const { limit, offset, sort, filter } = options

    const sortDirection = sort?.at(0)?.startsWith("-") ? "DESC" : "ASC"

    const whereClause = generateWhereClause(filter)

    const query = `
        SELECT * FROM ${this.selectedTable} 
        ${whereClause ? `WHERE ${whereClause}` : ""}
        ${sort ? `ORDER BY ${sort[0].replace("-", "")} ${sortDirection}` : ""}
        ${limit ? `LIMIT ${offset}, ${limit}` : ""}
      `

    return query
  }

  generateCountQuery(options: QueryOptions) {
    const { filter } = options

    const whereClause = generateWhereClause(filter)

    const query = `
        SELECT COUNT(*) as "total" FROM ${this.selectedTable} 
        ${whereClause ? `WHERE ${whereClause}` : ""}
      `

    return query
  }

  generateDeleteQuery({ filterByTk }: SpecificTargetQueryOptions) {
    let whereClause = ""
    if (!Array.isArray(filterByTk)) {
      filterByTk = [filterByTk]
    }
    for (const c of filterByTk) {
      let cl = ""
      for (const key of Object.keys(c)) {
        const type = typeof c[key]
        const values = (type == "string" ? [c[key]] : c[key]) as unknown as string[]
        console.log(key, values)
        const arrayStr = values.reduce((ac, ne) => `,'${ne}'` + ac, "").slice(1)
        console.log(arrayStr)
        cl += ` AND ${key} IN [${arrayStr}]`
      }
      cl = cl.slice(5)
      whereClause += cl
    }
    let query = `ALTER TABLE ${this.selectedTable} DELETE WHERE ${whereClause}`
    return query
  }

  // originals from IRepository
  async find(options: QueryOptions): Promise<IModel[]> {
    console.log("[CLICKHOUSE PL] find", options);

    const query = this.generateQuery(options)

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
    console.log("[CLICKHOUSE PL] find one", options);

    options.limit = 1
    options.offset = 0

    const query = this.generateQuery(options)

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
    return results[0]
  }

  async count(options: QueryOptions): Promise<Number> {
    console.log("[CLICKHOUSE PL] count")

    const res = await this.ch.query({
      query: this.generateCountQuery(options),
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

  async create({ values }: { values: Record<string, string | number> }) {
    console.log("[CLICKHOUSE PL] create", values)
    const keysStr = Object.keys(values)
    const valuesStr = keysStr.map(e => values[e]).reduce((ac, ne) => `,'${ne}'${ac}`, "").toString().slice(1)
    const query = `
      INSERT INTO ${this.selectedTable} (${keysStr.reverse().toString()}) 
      VALUES (${valuesStr});
    `
    console.log(query)
    await this.ch.command({ query })
  }

  async update(opt: { filter: Filter, values: any }) {
    throw new Error("Not implemented")
  }

  async destroy(options: SpecificTargetQueryOptions) {
    console.log("[CLICKHOUSE PL] delete")

    const query = this.generateDeleteQuery(options)

    await this.ch.query({
      query: query
    })
  }


}


