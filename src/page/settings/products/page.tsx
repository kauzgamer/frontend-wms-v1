import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HomeIcon, Plus, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProducts } from '@/lib/hooks/use-products'

export function ProductsPage() {
  const { data, isLoading, isError, refetch, isFetching } = useProducts()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
      <div>
        <Breadcrumb>
          <BreadcrumbList className="bg-background rounded-md border px-3 py-2 shadow-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">
                  <HomeIcon size={16} aria-hidden="true" />
                  <span className="sr-only">Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/settings">Configurador</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Produto/SKU</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>Cadastro produto/SKU</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`size-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
          <Button size="sm" asChild>
            <Link to="/settings/products/new"><Plus className="size-4 mr-1" /> Novo produto</Link>
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold" style={{ color: '#4a5c60' }}>Produtos</h2>
            <p className="text-xs mt-0.5" style={{ color: '#4a5c60' }}>Listagem básica de produtos retornados da API.</p>
          </div>
          {isLoading && <span className="text-xs" style={{ color: '#4a5c60' }}>Carregando...</span>}
          {isError && <span className="text-xs text-destructive">Erro ao carregar</span>}
        </div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b">
                <tr className="text-left">
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Nome</th>
                  <th className="px-3 py-2 font-medium">SKU</th>
                  <th className="px-3 py-2 font-medium">Criado</th>
                  <th className="px-3 py-2 font-medium">Atualizado</th>
                </tr>
              </thead>
              <tbody>
                {data?.length ? data.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={()=>{ window.location.href = `/settings/products/${p.id}` }}>
                    <td className="px-3 py-2 font-mono text-xs">{p.id}</td>
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2">{p.sku}</td>
                    <td className="px-3 py-2 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-xs">{new Date(p.updatedAt).toLocaleDateString()}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">
                      {isLoading ? 'Carregando...' : 'Nenhum produto cadastrado.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Legend / future filters placeholder */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600">ATIVO</Badge>
        <span>Status placeholder</span>
      </div>
    </div>
  )
}

export default ProductsPage
