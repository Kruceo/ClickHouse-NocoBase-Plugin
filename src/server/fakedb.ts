import { QueryInterfaceOptions, QueryInterfaceDropTableOptions } from "sequelize"
import { ClickhouseCollectionManager } from "./collectionManager"
import { Collection, CollectionOptions, Database, Field, FieldOptions, RepositoryType, SyncOptions, Transactionable } from "@nocobase/database"
import { ClickHouseClient } from "@clickhouse/client"

// this is a "gambiarra" to nocobase chart work 'right'
export class FakeDatabase extends Database {
    ch: ClickHouseClient
    collectionManager: ClickhouseCollectionManager
    constructor(options: { dialect: "mysql" | "mariadb", ch: ClickHouseClient, collectionManager: ClickhouseCollectionManager }) {
        super(options)
        this.ch = options.ch
        this.collectionManager = options.collectionManager
    }

    getCollection(name: string): Collection {
        const original = this.collectionManager.getCollection(name) as ReturnType<typeof this.collections.get> & { fields: Map<string, any> }

        const attributes: any = {}
        original.fields.forEach((v: { options: any }, k) => {
            attributes[k] = { field: k, fieldName: k, _modelAttribute: true, ...v.options }
        })

        return {
            ...original,
            isMultiFilterTargetKey: () => false,
            context: { database: this },
            model: {
                getAttributes: () => attributes, associations: {}, // é bom arrumar essa bagaça depois
                // opt is a sequelize query options
                findAll: async (opt: any) => {
                    const p = this.sequelize.getQueryInterface().queryGenerator as { selectQuery: (table: string, options: any) => string }
                    const query = p.selectQuery(name, opt)
                    const res = await this.ch.query({ query: query, format: "JSON" })
                    return (await res.json<any>()).data
                }
            } as any,
            filterTargetKey: "",
            name: "",
            origin: "",
            titleField: "",
            db: this,
            treeParentField: null,
            treeChildrenField: null,
            tableName: function () {
                throw new Error("Function not implemented.")
            },
            modelInit: function (): void {
                throw new Error("Function not implemented.")
            },
            setRepository: function (repository?: RepositoryType | string): void {
                throw new Error("Function not implemented.")
            },
            forEachField: function (callback: (field: Field) => void): void {
                throw new Error("Function not implemented.")
            },
            findField: function (callback: (field: Field) => boolean) {
                throw new Error("Function not implemented.")
            },
            hasField: function (name: string): boolean {
                throw new Error("Function not implemented.")
            },
            getField: function <F extends Field>(name: string): F {
                throw new Error("Function not implemented.")
            },
            getFieldByField: function (field: string): Field {
                throw new Error("Function not implemented.")
            },
            getFields: function (): any[] {
                throw new Error("Function not implemented.")
            },
            addField: function (name: string, options: FieldOptions): Field {
                throw new Error("Function not implemented.")
            },
            checkFieldType: function (name: string, options: FieldOptions): void {
                throw new Error("Function not implemented.")
            },
            correctOptions: function (options: any): void {
                throw new Error("Function not implemented.")
            },
            setField: function (name: string, options: FieldOptions): Field {
                throw new Error("Function not implemented.")
            },
            setFields: function (fields: FieldOptions[], resetFields?: boolean): void {
                throw new Error("Function not implemented.")
            },
            resetFields: function (): void {
                throw new Error("Function not implemented.")
            },
            remove: function (): Collection<any, any> {
                throw new Error("Function not implemented.")
            },
            removeFieldFromDb: function (name: string, options?: QueryInterfaceOptions): Promise<void> {
                throw new Error("Function not implemented.")
            },
            removeFromDb: function (options?: QueryInterfaceDropTableOptions & { dropCollection?: boolean }): Promise<Collection<any, any>> {
                throw new Error("Function not implemented.")
            },
            existsInDb: function (options?: Transactionable): Promise<boolean> {
                throw new Error("Function not implemented.")
            },
            removeField: function (name: string): void | Field {
                throw new Error("Function not implemented.")
            },
            updateOptions: function (options: CollectionOptions, mergeOptions?: any): Collection<any, any> {
                throw new Error("Function not implemented.")
            },
            setSortable: function (sortable: any): void {
                throw new Error("Function not implemented.")
            },
            updateField: function (name: string, options: FieldOptions): void {
                throw new Error("Function not implemented.")
            },
            addIndex: function (index: string | string[] | { fields: string[]; unique?: boolean;[key: string]: any }): void {
                throw new Error("Function not implemented.")
            },
            removeIndex: function (fields: any): void {
                throw new Error("Function not implemented.")
            },
            refreshIndexes: function (): void {
                throw new Error("Function not implemented.")
            },
            sync: function (syncOptions?: SyncOptions): Promise<void> {
                throw new Error("Function not implemented.")
            },
            isInherited: function (): boolean {
                throw new Error("Function not implemented.")
            },
            isParent: function (): boolean {
                throw new Error("Function not implemented.")
            },
            getTableNameWithSchema: function () {
                throw new Error("Function not implemented.")
            },
            tableNameAsString: function (options?: { ignorePublicSchema: boolean }) {
                throw new Error("Function not implemented.")
            },
            getRealTableName: function (quoted?: boolean) {
                throw new Error("Function not implemented.")
            },
            getRealFieldName: function (name: string, quoted?: boolean): string {
                throw new Error("Function not implemented.")
            },
            getTableNameWithSchemaAsString: function (): string {
                throw new Error("Function not implemented.")
            },
            quotedTableName: function () {
                throw new Error("Function not implemented.")
            },
            collectionSchema: function (): string {
                throw new Error("Function not implemented.")
            },
            isView: function (): boolean {
                throw new Error("Function not implemented.")
            },
            unavailableActions: function (): any[] {
                throw new Error("Function not implemented.")
            },
            sequelizeModelOptions: function (): { modelName: string; sequelize: import("sequelize").Sequelize; tableName: any } {
                throw new Error("Function not implemented.")
            },
            bindFieldEventListener: function (): void {
                throw new Error("Function not implemented.")
            },
            checkOptions: undefined,
            checkTableName: undefined,
            addListener: function <K>(eventName: string | symbol, listener: (...args: any[]) => void): Collection<any, any> {
                throw new Error("Function not implemented.")
            },
            on: function <K>(eventName: string | symbol, listener: (...args: any[]) => void): Collection<any, any> {
                throw new Error("Function not implemented.")
            },
            once: function <K>(eventName: string | symbol, listener: (...args: any[]) => void): Collection<any, any> {
                throw new Error("Function not implemented.")
            },
            removeListener: function <K>(eventName: string | symbol, listener: (...args: any[]) => void): Collection<any, any> {
                throw new Error("Function not implemented.")
            },
            off: function <K>(eventName: string | symbol, listener: (...args: any[]) => void): Collection<any, any> {
                throw new Error("Function not implemented.")
            },
            removeAllListeners: function (eventName?: string | symbol | undefined): Collection<any, any> {
                throw new Error("Function not implemented.")
            },
            setMaxListeners: function (n: number): Collection<any, any> {
                throw new Error("Function not implemented.")
            },
            getMaxListeners: function (): number {
                throw new Error("Function not implemented.")
            },
            listeners: function <K>(eventName: string | symbol): Function[] {
                throw new Error("Function not implemented.")
            },
            rawListeners: function <K>(eventName: string | symbol): Function[] {
                throw new Error("Function not implemented.")
            },
            emit: function <K>(eventName: string | symbol, ...args: any[]): boolean {
                throw new Error("Function not implemented.")
            },
            listenerCount: function <K>(eventName: string | symbol, listener?: Function | undefined): number {
                throw new Error("Function not implemented.")
            },
            prependListener: function <K>(eventName: string | symbol, listener: (...args: any[]) => void): Collection<any, any> {
                throw new Error("Function not implemented.")
            },
            prependOnceListener: function <K>(eventName: string | symbol, listener: (...args: any[]) => void): Collection<any, any> {
                throw new Error("Function not implemented.")
            },
            eventNames: function (): (string | symbol)[] {
                throw new Error("Function not implemented.")
            }
        } as any
    }
}

