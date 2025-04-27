import { Collection, CollectionManager, CollectionOptions, DataSource, ICollection, ICollectionManager, IRepository, MergeOptions } from "@nocobase/data-source-manager"
import { ClickhouseRepository } from "./repo";


export class ClickhouseCollectionManager extends CollectionManager {

  protected collections: Map<string, ICollection> = new Map()
  protected repositories: Map<string, IRepository> = new Map();

  constructor(options?){
    super(options)
  }  

  defineCollection(options): Collection {
    console.log("[CLICKHOUSE PL] defining collection",options)
    const collection = new Collection({...options,repository:ClickhouseRepository},this);
    this.collections.set(options.name, collection);
    return collection;
  }

  newCollection(options): Collection {
    console.log("[CLICKHOUSE PL] new collection",options)
    const collection = new Collection({...options,repository:ClickhouseRepository},this);
    this.collections.set(options.name, collection);
    return collection;
  }

  getCollection(name:string): ICollection {
    console.log("[CLICKHOUSE PL] get collection",name)
    return this.collections.get(name) as ICollection
  }

  getCollections(opt?): Array<ICollection> {
    console.log("[CLICKHOUSE PL] get collections",opt)
    return [...this.collections.values()]
  }
}

