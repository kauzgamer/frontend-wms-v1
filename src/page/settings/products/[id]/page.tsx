import { Link, useParams, useNavigate } from 'react-router-dom'
import { useProduct } from '@/lib/hooks/use-product'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { HomeIcon } from 'lucide-react'
import { useState } from 'react'

interface CollapseState {
  unidades: boolean
  caracteristicas: boolean
  atributos: boolean
  selecao: boolean
  fornecedores: boolean
}

export function ProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: product, isLoading, isError } = useProduct(id)
  const [open, setOpen] = useState<CollapseState>({ unidades: false, caracteristicas: false, atributos: false, selecao: false, fornecedores: false })

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
              <BreadcrumbLink asChild>
                <Link to="/settings/products">Cadastro produto/SKU</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Detalhes</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>Detalhes do produto</h1>
        <div className="flex gap-2">
          <button onClick={()=>navigate(`/settings/products/${id}/edit`)} className="h-10 px-6 inline-flex items-center justify-center rounded border text-sm font-medium hover:bg-muted/40">Editar dados principais</button>
          <button onClick={()=>navigate('/settings/products')} className="h-10 px-6 inline-flex items-center justify-center rounded bg-[#008bb1] text-white text-sm font-medium hover:bg-[#007697]">Voltar</button>
        </div>
      </div>

      {isLoading && <p className="text-sm">Carregando...</p>}
      {isError && <p className="text-sm text-red-600">Erro ao carregar.</p>}
      {!isLoading && !isError && product && (
        <>
          <section>
            <h2 className="text-xs font-semibold tracking-wide text-[#008bb1] mb-4">DADOS PRINCIPAIS</h2>
            <div className="grid grid-cols-6 gap-y-6 text-sm">
              <div className="col-span-1">
                <div className="text-xs font-medium mb-1 text-[#334b52]">Código</div>
                <div>{product.sku || '-'}</div>
              </div>
              <div className="col-span-1">
                <div className="text-xs font-medium mb-1 text-[#334b52]">Código externo</div>
                <div>-</div>
              </div>
              <div className="col-span-1">
                <div className="text-xs font-medium mb-1 text-[#334b52]">Unidade de medida</div>
                <div>{product.unitOfMeasure || '-'}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs font-medium mb-1 text-[#334b52]">Descrição</div>
                <div className="uppercase">{product.name || '-'}</div>
              </div>
              <div className="col-span-1">
                <div className="text-xs font-medium mb-1 text-[#334b52]">Categoria</div>
                <div>-</div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xs font-semibold tracking-wide text-[#008bb1] mb-4">CONTROLE DO ARMAZÉM</h2>
            <div className="border rounded shadow-sm bg-white">
              {[
                { key: 'unidades', label: 'Unidades' },
                { key: 'caracteristicas', label: 'Características' },
                { key: 'atributos', label: 'Atributos' },
                { key: 'selecao', label: 'Seleção de estoque' },
                { key: 'fornecedores', label: 'Fornecedores' },
              ].map(item => (
                <div key={item.key} className="border-b last:border-b-0">
                  <button type="button" onClick={()=>setOpen(o=>({...o, [item.key]: !o[item.key as keyof CollapseState]}))} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#006c87] hover:bg-muted/40">
                    {item.label}
                    <span className="text-xs">{open[item.key as keyof CollapseState] ? '▾' : '▸'}</span>
                  </button>
                  {open[item.key as keyof CollapseState] && (
                    <div className="px-4 py-4 text-xs text-muted-foreground">Conteúdo futuro: {item.label}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default ProductDetailsPage
