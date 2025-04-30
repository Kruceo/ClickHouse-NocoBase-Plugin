import { Collection, CollectionManager, CollectionOptions, DataSource, ICollection, ICollectionManager, IRepository, MergeOptions, SequelizeCollectionManager } from "@nocobase/data-source-manager"

import { ClickhouseRepository } from "./repo";
import {FakeDatabase} from "./fakedb";
import { ClickHouseClient } from "@clickhouse/client";

export class ClickhouseCollectionManager extends CollectionManager {

  protected collections: Map<string, ICollection> = new Map()
  protected repositories: Map<string, IRepository> = new Map();
  db: FakeDatabase
  ch: ClickHouseClient;


  constructor(options) {
    console.log("[CLICKHOUSE PL] creating collection manager",options)
    super(options)
    this.ch = options.ch
    this.db = new FakeDatabase({dialect:"mysql",ch:options.ch,collectionManager:this})
  }

  defineCollection(options): Collection {
    console.log("[CLICKHOUSE PL] defining collection", options)
    const collection = new Collection({ ...options, repository: ClickhouseRepository }, this);
    this.collections.set(options.name, collection);
    return collection;
  }

  newCollection(options): Collection {
    console.log("[CLICKHOUSE PL] new collection", options)
    const collection = new Collection({ ...options, repository: ClickhouseRepository }, this);
    this.collections.set(options.name, collection);
    return collection;
  }

  getCollection(name: string): ICollection {
    console.log("[CLICKHOUSE PL] get collection", name)
    this.collections.get(name)
    return this.collections.get(name) as ICollection
  }

  getCollections(opt?): Array<ICollection> {
    console.log("[CLICKHOUSE PL] get collections", opt)
    return [...this.collections.values()]
  }


}

