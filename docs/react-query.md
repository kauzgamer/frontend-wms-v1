# React Query Integration Guide

## Visão Geral
A aplicação agora utiliza TanStack React Query para cache, sincronização e estados de carregamento de requisições. O overlay global de loading considera:
1. Transições de rota (React Router + Suspense)
2. Qualquer query com status fetching (`useIsFetching() > 0`)

## Estrutura Principal
- Provedor: configurado em `src/main.tsx` com `QueryClientProvider`.
- Devtools: habilitadas (podem ser removidas em produção).
- Loader global: implementado em `App.tsx` verificando `useIsFetching`.
- API mock: `src/lib/api/integration.ts` com `fetchIntegrationTransactions`.

## Criando uma Nova Query
Exemplo:
```tsx
import { useQuery } from '@tanstack/react-query'
import { myFetchFn } from '@/lib/api/my-endpoint'

function MyComponent() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-endpoint', { page: 1 }],
    queryFn: () => myFetchFn(1),
    staleTime: 60_000,
  })

  if (isLoading) return <div>Carregando...</div>
  if (isError) return <div>Erro ao carregar</div>
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
```

## Boas Práticas
- Use `queryKey` estável e semântica: `['integration','transactions']`.
- Inclua parâmetros no `queryKey` (ex.: paginação, filtros): `['integration','transactions',{ page, status }]`.
- Ajuste `staleTime` para reduzir refetchs agressivos.
- Prefira `refetch()` ou `invalidateQueries` ao invés de estados locais duplicados.

## Invalidando / Atualizando
```ts
import { useQueryClient } from '@tanstack/react-query'
const qc = useQueryClient()
qc.invalidateQueries({ queryKey: ['integration','transactions'] })
```

## Estados e UI
| Estado | Indicador Local | Overlay Global |
|--------|-----------------|----------------|
| isLoading inicial | Componente mostra placeholder/spinner | Sim (por Suspense se lazy) |
| isFetching (background) | Linha "Atualizando..." na tabela | Sim (overlay) |
| Error | Mensagem contextual | Não |

## Tratando Erros Centralmente
Adicionar `QueryCache` customizado no `QueryClient` (ex.: logging/toast) futuramente:
```ts
new QueryClient({
  queryCache: new QueryCache({
    onError: (err, query) => {
      console.error('Query error', query.queryKey, err)
    }
  })
})
```

## Próximos Passos Sugeridos
1. Paginação servidor: adicionar `page`, `pageSize` ao `queryKey`.
2. Filtros de status/processo controlados e refletidos na chave.
3. Prefetch ao focar links (ex.: onMouseEnter de item de menu).
4. Retry configurado (`retry: 2`) para queries sensíveis.
5. Cache de erro separado para mostrar botão "Tentar novamente".

## Remoções Possíveis
- Arquivo `with-page-loader.tsx` pode ser removido se não mais utilizado.

## Observações de Produção
- Desabilitar Devtools.
- Implementar boundary de erro global.
- Ajustar `gcTime`/`staleTime` conforme volume de dados.

---
Atualizado: 