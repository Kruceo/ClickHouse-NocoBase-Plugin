import { Plugin, SchemaComponent, Space } from '@nocobase/client';

const pluginName = "ClickHouse"

function DataSourceForm() {

  return (
    <SchemaComponent
      scope={{ pluginName }}
      components={{ Space }}
      schema={{
        type: 'object',
        properties: {
          key: {
            type: 'string',
            title: "Name (Key)",
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-validator': 'uid',
            'x-disabled': '{{ createOnly }}',
            description: ""
          },
          displayName: {
            type: 'string',
            title: "Display Name",
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
          },
          options: {
            type: 'object',
            properties: {
              host: {
                type: 'string',
                title: "Host",
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'TextAreaWithGlobalScope',
                default: 'localhost',
              },
              port: {
                type: 'string',
                title: "Port",
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'TextAreaWithGlobalScope',
                default: 8123,
              },
              useSSL: {
                type: "boolean",
                required: true,
                'x-content': "Use SSL",
                'x-decorator': "FormItem",
                "x-component": "Checkbox",
                default: false
              },
              database: {
                type: 'string',
                title: "DB",
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'TextAreaWithGlobalScope',
                default: "default"
              },
              username: {
                type: 'string',
                title: "User",
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'TextAreaWithGlobalScope',
              },
              password: {
                type: 'string',
                title: "Password",
                'x-decorator': 'FormItem',
                'x-component': 'TextAreaWithGlobalScope',
                'x-component-props': {
                  password: true,
                },
              },
            },
          }
        },
      }}
    />
  );
}

class PluginClickHouse extends Plugin {

  async afterAdd() { }

  async beforeLoad() { }

  async load() {
    const dsm = this.app.pm.get("data-source-manager") as any
    dsm.registerType('clickhouse', {
      DataSourceSettingsForm: DataSourceForm,
      label: 'ClickHouse'
    })
  }
}

export default PluginClickHouse;
export { PluginClickHouse }