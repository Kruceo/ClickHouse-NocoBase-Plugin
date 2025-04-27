import { DataSource, ICollectionManager } from "@nocobase/data-source-manager"
import { ClickhouseCollectionManager } from "./collectionManager";
import { ClickHouseClient, createClient } from "@clickhouse/client";


// import { DataSource, ICollectionManager } from '@nocobase/database';

export class ClickHouseDataSource extends DataSource {
  private __name: string
  private __database: string;
  ch: ClickHouseClient;

  constructor(options) {

    console.log("[CLICKHOUSE PL] construindo datasource", options)
    super(options)
    this.ch = createClient({
      username: options.username,
      password: options.password == "" ? undefined : options.password,
      database: options.database,
      url: `${options.useSSL?"https":"http"}://${options.host}:${options.port}`
    })
    this.__database = options.database
    this.__name = options.name
  }
  static getDialect() {
    return "custom";
  }
  // Retorna um gerenciador de coleção (deve ser implementado)sa
  createCollectionManager(options?: any): ICollectionManager {
    return new ClickhouseCollectionManager(options)
  }

  // extra
  async getDBTables() {
    const res = await this.ch.query({
      query: "show TABLES",
      format: "JSON"
    })
    const data = (await res.json()).data as { name: string }[]
    console.log(data)
    return data.map(e => e.name)
  }

  // extra 
  async getTableFIeldTypes(table: string) {
    const res = await this.ch.query({
      format: "JSON",
      query: `
        SELECT
          name,
          type
        FROM system.columns
        WHERE database = '${this.__database}' AND table = '${table}';
        `.trim()
    })

    const d = await res.json<{ type: string, name: string }>()
    const formated = d.data.map((a) => {
      a.type = a.type.toLowerCase()
      if (a.type.includes("int"))
        a.type = "integer"
      else if (a.type.includes("float"))
        a.type = "float"
      else if (a.type.includes("enum"))
        a.type = "string"
      else if (a.type.includes("uuid"))
        a.type = "uuid"
      else
        a.type = "string"
      switch (a.type) {
        case "int":
          a.type = "integer"
          break;

        default:
          break;
      }
      const f = { ...a, interface: a.type, uiSchema: { title: a.name } }
      return f
    })
    return formated
  }

  async load(options: LoadDataSourceOptions) {
    console.log("[CLICKHOUSE PL] load", options)
    this.emitLoadingProgress({ loaded: 20, total: 100 })

    const tables = await this.getDBTables()

    this.emitLoadingProgress({ loaded: 50, total: 100 })

    for (const tableName of tables) {
      let fields = await this.getTableFIeldTypes(tableName)
      const localDataFields = options.localData?.[tableName]?.fields
      if (localDataFields) {
        const ldfObject = localDataFields.reduce((ac, ne) => {
          ac[ne.name] = ne
          return ac
        }, {} as any)

        const merged = fields.map(e => {
          if (ldfObject[e.name])
            return { ...e, ...ldfObject[e.name] }
          return e
        })
        fields = merged
      }
      const collection = {
        fields: fields,
        name: tableName,
        title: options.localData?.[tableName]?.title ?? tableName,
        filterTargetKey: options.localData?.[tableName]?.filterTargetKey
      }
      console.log(collection)
      this.collectionManager.defineCollection(collection)
    }

    this.emitLoadingProgress({ loaded: 100, total: 100 })
  }

  // Nome da fonte de dados
  get name(): string {
    return this.__name;
  }
}
