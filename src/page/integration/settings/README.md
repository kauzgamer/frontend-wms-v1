# Configurações de Integração

Esta pasta contém as páginas de configuração de integração do sistema WMS.

## Estrutura de Pastas

Cada página de configuração está em sua própria pasta:

```
settings/
├── page.tsx                    # Página principal - lista de configurações
├── organizacao/
│   └── page.tsx               # Configuração da Organização (empresa)
├── erp-integration/
│   └── page.tsx               # Configuração de Integração ERP via ODBC
└── unified-product/
    └── page.tsx               # Produto Unificado - Sincronização de Produtos
```

## Rotas

- `/integration/settings` - Página principal com lista de configurações
- `/integration/settings/organizacao` - Configuração da Organização
- `/integration/settings/erp-integration` - Integração com ERP via ODBC
- `/integration/settings/unified-product` - Sincronização de Produtos

## Páginas

### 1. Organização (`organizacao/`)
**Rota:** `/integration/settings/organizacao`

Configuração dos dados da empresa/organização:
- Código da organização
- Nome (Razão Social)
- CNPJ
- Timezone
- Status (Ativo/Inativo)

### 2. Integração ERP (`erp-integration/`)
**Rota:** `/integration/settings/erp-integration`

Configuração da conexão ODBC com o ERP:
- Parâmetros de conexão (DSN, UID, PWD, Host, Port, Database)
- Teste de conexão
- Sincronização de produtos
- Visualização de resultados e erros

### 3. Produto Unificado (`unified-product/`)
**Rota:** `/integration/settings/unified-product`

Sincronização de produtos do ERP para o WMS:
- Botão de sincronização
- Status da última sincronização
- Resultado detalhado (produtos sincronizados, erros)
- Configurações de integração

## Como Adicionar Nova Configuração

1. Crie uma nova pasta com o nome da configuração
2. Crie um arquivo `page.tsx` dentro da pasta
3. Adicione a rota no `App.tsx`
4. Adicione o item na lista em `settings/page.tsx`

Exemplo:
```tsx
// settings/nova-config/page.tsx
export function NovaConfigPage() {
  return <div>Nova Configuração</div>
}

export default NovaConfigPage
```

```tsx
// App.tsx
const NovaConfigPage = lazy(() => import("@/page/integration/settings/nova-config/page"));

// Adicionar rota:
<Route path="/integration/settings/nova-config" element={<NovaConfigPage />} />
```

```tsx
// settings/page.tsx
const configItems: ConfigItem[] = [
  // ...outras configs
  { id: 'nova-config', title: 'Nova Configuração', path: '/integration/settings/nova-config' },
]
```

