import { Collection, CollectionManager, CollectionOptions, ICollection, IRepository } from "@nocobase/data-source-manager"

import { ClickhouseRepository } from "./repo";
import { FakeDatabase } from "./fakedb";
import { ClickHouseClient } from "@clickhouse/client";

export class ClickhouseCollectionManager extends CollectionManager {

  protected collections: Map<string, ICollection> = new Map()
  protected repositories: Map<string, IRepository> = new Map();
  db: FakeDatabase
  ch: ClickHouseClient;


  constructor(options: { options:any,ch: ClickHouseClient }) {
    console.log("[CLICKHOUSE PL] creating collection manager", options)
    super(options)
    
    this.ch = options.ch
    this.db = new FakeDatabase({ dialect: "mysql", ch: options.ch, collectionManager: this })
  }

  defineCollection(options: Omit<CollectionOptions, "repository">): Collection {
    // console.log("[CLICKHOUSE PL] defining collection", options)
    const collection = new Collection({ ...options, repository: ClickhouseRepository } as any, this);
    this.collections.set(options.name, collection);
    return collection;
  }

  newCollection(options: Omit<CollectionOptions, "repository">): Collection {
    // console.log("[CLICKHOUSE PL] new collection", options)
    const collection = new Collection({ ...options, repository: ClickhouseRepository } as any, this);
    this.collections.set(options.name, collection);
    return collection;
  }

  getCollection(name: string): ICollection {
    // console.log("[CLICKHOUSE PL] get collection", name)
    this.collections.get(name)
    return this.collections.get(name) as ICollection
  }

  getCollections(): Array<ICollection> {
    // console.log("[CLICKHOUSE PL] get collections")
    return [...this.collections.values()]
  }


}

