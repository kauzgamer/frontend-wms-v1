import { Link, useNavigate, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { HomeIcon } from 'lucide-react'
import { useProduct } from '@/lib/hooks/use-product'
import { useState, useEffect } from 'react'
import { productCreateSchema, type ProductCreateForm } from '@/lib/validation/product'
import { useUpdateProduct } from '@/lib/hooks/use-update-product'

export function EditProductMainDataPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data: product, isLoading } = useProduct(id)
  const { mutateAsync, isPending } = useUpdateProduct()
  const [form, setForm] = useState<ProductCreateForm>({
    name: '',
    sku: '',
    externalCode: '',
    mobileDescription: '',
    unitOfMeasure: '',
    category: '',
    unit: '',
    stockCharacteristics: [],
    organizationId: undefined,
  })
  const [errors, setErrors] = useState<string[]>([])

  useEffect(()=>{
    if (product) {
      setForm(f=>({
        ...f,
        name: product.name || '',
        sku: product.sku || '',
        unitOfMeasure: product.unitOfMeasure || '',
        unit: product.unit || '',
      }))
    }
  },[product])

  function update<K extends keyof ProductCreateForm>(key: K, value: ProductCreateForm[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = productCreateSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(parsed.error.issues.map(i => i.message))
      return
    }
    setErrors([])
    if (!id) return
    await mutateAsync({ id, name: parsed.data.name, sku: parsed.data.sku, unit: parsed.data.unit, unitOfMeasure: parsed.data.unitOfMeasure })
    navigate(`/settings/products/${id}`)
  }

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
              <BreadcrumbLink asChild>
                <Link to={`/settings/products/${id}`}>Detalhes</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Editar dados principais</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>Editar dados principais</h1>
        <div className="flex gap-2">
          <button onClick={()=>navigate(`/settings/products/${id}`)} className="h-10 px-6 inline-flex items-center justify-center rounded border text-sm font-medium hover:bg-muted/40">Cancelar</button>
          <button form="edit-form" type="submit" disabled={isPending} className="h-10 px-6 inline-flex items-center justify-center rounded bg-[#008bb1] text-white text-sm font-medium hover:bg-[#007697] disabled:opacity-50">{isPending?'Salvando...':'Salvar'}</button>
        </div>
      </div>

      <form id="edit-form" onSubmit={handleSubmit} className="space-y-8">
        <section>
          <h2 className="text-xs font-semibold tracking-wide text-[#008bb1] mb-4">PRODUTO</h2>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#334b52]">Código do produto</label>
              <input value={form.sku || ''} onChange={e=>update('sku', e.target.value)} placeholder="Informe o código" className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#334b52]">Código do produto externo <span className="text-muted-foreground text-xs font-normal">(Opcional)</span></label>
              <input value={form.externalCode || ''} onChange={e=>update('externalCode', e.target.value)} placeholder="Informe o código" className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#334b52]">Unidade de medida</label>
              <select value={form.unitOfMeasure || ''} onChange={e=>update('unitOfMeasure', e.target.value)} className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]">
                <option value="">Selecione a unidade de medida</option>
                <option value="UN">UN</option>
                <option value="CX">CX</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-[#334b52]">Descrição</label>
              <textarea value={form.name || ''} onChange={e=>update('name', e.target.value)} placeholder="Informe a descrição" className="min-h-[90px] rounded border px-3 py-2 text-sm bg-white shadow-sm resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#334b52]">Descrição mobile <span className="text-muted-foreground text-xs font-normal">(Opcional)</span></label>
              <textarea value={form.mobileDescription || ''} onChange={e=>update('mobileDescription', e.target.value)} placeholder="Informe a descrição" className="min-h-[90px] rounded border px-3 py-2 text-sm bg-white shadow-sm resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#334b52]">Categoria <span className="text-muted-foreground text-xs font-normal">(Opcional)</span></label>
              <select value={form.category || ''} onChange={e=>update('category', e.target.value)} className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]">
                <option value="">Selecione a categoria</option>
                <option value="GERAL">GERAL</option>
              </select>
            </div>
          </div>
        </section>
      </form>

      {errors.length > 0 && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 space-y-1">
          {errors.map(err => <div key={err}>{err}</div>)}
        </div>
      )}

      {isLoading && <div className="text-xs text-muted-foreground">Carregando produto...</div>}
    </div>
  )
}

export default EditProductMainDataPage
