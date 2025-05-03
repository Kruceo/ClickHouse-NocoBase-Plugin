# ClickHouse-NocoBase-Plugin

## Funcionalidades implementadas

- 🔼 CRUD completo  
- ✅ Suporte a tabelas simples  
- ✅ Paginação (`limit`, `offset`)  
- ✅ Filtros complexos
- ✅ Ordenação (Sort)  
- ✅ Compatível com gráficos  
- ❌ Compatibilidade com Workflows (em desenvolvimento)

---

## Pré-requisitos

Instale o Yarn:

```bash
npm install --global yarn
yarn -v
# Deve exibir: 1.22.21 ou superior
```

---

## Criando um app NocoBase

Siga o guia oficial para criar uma aplicação NocoBase:  
📄 [Documentação Oficial - Criar app NocoBase](https://docs.nocobase.com/welcome/getting-started/installation/create-nocobase-app)

---

## Instalação do plugin

1. Navegue até a pasta de plugins:
   ```bash
   cd packages/plugins
   ```

2. Clone este repositório:
   ```bash
   git clone <url-deste-repo> ./@kruceo/clickhouse-datasource
   ```

3. Acesse a pasta do plugin:
   ```bash
   cd @kruceo/clickhouse-datasource
   ```

4. Instale as dependências:
   ```bash
   yarn install
   ```

---

## Build

Dentro da pasta `@kruceo/clickhouse-datasource`, execute:

```bash
yarn build
```

O arquivo `.zip` gerado estará disponível na pasta `dist/`, pronto para ser importado no NocoBase.
