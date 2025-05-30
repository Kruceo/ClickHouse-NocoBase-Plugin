import { Plugin } from '@nocobase/server';
import ClickHouseDataSource from './datasource';

class PluginClickHouse extends Plugin {
  async afterAdd() { }

  async beforeLoad() {
    console.log("======================= carregou legal ===============================")
    this.app.dataSourceManager.factory.register("clickhouse", ClickHouseDataSource);
  }

  async load() {
  }

  async install() {

  }

  async afterEnable() { }

  async afterDisable() { }

  async remove() { }
}

export default PluginClickHouse;