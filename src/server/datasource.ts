import { DataSource, ICollectionManager, SequelizeDataSource } from "@nocobase/data-source-manager"
import { ClickhouseCollectionManager } from "./collectionManager";
import { ClickHouseClient, createClient } from "@clickhouse/client";

export class ClickHouseDataSource extends DataSource {
  private __name: string
  private __database: string;
  ch: ClickHouseClient;
  constructor(options) {
    console.log("[CLICKHOUSE PL] creating datasource", options)
    super(options)
    // ch (clickhouse is defined at createCollectionManager)
    console.log(this.acl.getAvailableActions())
    this.__database = options.database
    this.__name = options.name
  }
  static getDialect() {
    console.log("get dialect bro")
    return "mysql";
  }
  // Retorna um gerenciador de coleção (deve ser implementado)sa
  createCollectionManager(options?: any) {
    if (!this.ch)
      this.ch = createClient({
        username: options.username,
        password: options.password == "" ? undefined : options.password,
        database: options.database,
        url: `${options.useSSL ? "https" : "http"}://${options.host}:${options.port}`
      })
    return new ClickhouseCollectionManager({ options, ch: this.ch })
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

    const d = await res.json<{ type: string, name: string, possibleTypes?: string[], rawType?: string }>()
    const formated = d.data.map((a) => {
      a.rawType = a.type
      a.type = a.type.toLowerCase()
      if (a.type.includes("int")) {
        a.type = "integer"
        a.possibleTypes = ["integer", "unixTimestamp", "sort"]
        a["x-component"] = "InputNumber"
        a["x-component-props"] = {
          stringMode: true,
          step: 1
        }
      }
      else if (a.type.includes("float")) {
        a.type = "float"
        a.possibleTypes = ["integer", "unixTimestamp", "sort"]
        a["x-component"] = "InputNumber"
        a["x-component-props"] = {
          stringMode: true,
          step: 1
        }
      }
      else if (a.type.includes("bool"))
        a.type = "boolean"
      else if (a.type.includes("date")) {
        a.type = "datetime"
        a.possibleTypes = ["datetime", "datetimeTz"]
        a["x-component"] = "DatePicker"
        a["x-component-props"] = {

        }
      }
      else if (a.type.includes("enum"))
        a.type = "string"
      else if (a.type.includes("uuid"))
        a.type = "uuid"
      else {
        a.type = "string"
        a.possibleTypes = ["string", "uuid", "nanoid", "encryption", "datetimeTz", "datetime"]
      }
      const f = {
        ...a,

        interface: a.type,
        uiSchema: {
          type: ['integer', 'float'].includes(a.type) ? "number" : "string",
          title: a.name,
          "x-validator": a.type
        }
      }
      return f
    })
    console.log(formated)
    return formated
  }



  async load(options: LoadDataSourceOptions) {
    console.log("[CLICKHOUSE PL] load", options)
    this.emitLoadingProgress({ loaded: 0.1, total: 1 })

    const tables = await this.getDBTables()

    this.emitLoadingProgress({ loaded: 0.2, total: 1 })

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
      console.log(fields)
      const collection = {
        collectionType: "table",
        isSystem: false,
        fields: fields,
        name: tableName,
        title: options.localData?.[tableName]?.title ?? tableName,
        filterTargetKey: options.localData?.[tableName]?.filterTargetKey
      }
      console.log(collection)
      this.collectionManager.defineCollection(collection)
    }

    this.emitLoadingProgress({ loaded: 1, total: 1 })
  }

  // Nome da fonte de dados
  get name(): string {
    return this.__name;
  }
}

