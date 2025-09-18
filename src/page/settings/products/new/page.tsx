import { Link, useNavigate } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { HomeIcon } from 'lucide-react'
import { productCreateSchema, type ProductCreateForm } from '@/lib/validation/product'
import { useState } from 'react'
import { useCreateProduct } from '@/lib/hooks/use-create-product'

export function NewProductPage() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreateProduct()
  const [form, setForm] = useState<ProductCreateForm>({
    name: '',
    sku: '',
    externalCode: '',
    mobileDescription: '',
    unitOfMeasure: '',
    category: '',
    unit: '',
    stockCharacteristics: [],
  })
  const [errors, setErrors] = useState<string[]>([])

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
    try {
      await mutateAsync(parsed.data)
      navigate('/settings/products')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar'
      setErrors([message])
    }
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
              <BreadcrumbPage>Novo produto/SKU</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>Novo produto/SKU</h1>
          <div className="flex gap-2">
            <Link to="/settings/products" className="h-10 px-6 inline-flex items-center justify-center rounded border text-sm font-medium hover:bg-muted/40">Cancelar</Link>
            <button type="submit" disabled={isPending} className="h-10 px-6 inline-flex items-center justify-center rounded bg-[#008bb1] text-white text-sm font-medium hover:bg-[#007697] disabled:opacity-50">{isPending ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </div>

        <section>
          <h2 className="text-xs font-semibold tracking-wide text-[#008bb1] mb-4">DADOS PRINCIPAIS</h2>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#334b52]">Código do produto <span className="text-muted-foreground text-xs font-normal">(Opcional)</span></label>
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
              <label className="text-sm font-medium text-[#334b52]">Descrição <span className="text-muted-foreground text-xs font-normal">(Opcional)</span></label>
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

        <section>
          <h2 className="text-xs font-semibold tracking-wide text-[#008bb1] mb-4">DADOS ADICIONAIS</h2>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#334b52]">Unidade</label>
              <select value={form.unit || ''} onChange={e=>update('unit', e.target.value)} className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]">
                <option value="">Selecione a unidade</option>
                <option value="UN">UN</option>
                <option value="CX">CX</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-[#334b52]">Características de estoque <span className="text-muted-foreground text-xs font-normal">(Opcional)</span></label>
              <select multiple value={form.stockCharacteristics?.map(String) || []} onChange={e=>{
                const opts = Array.from(e.target.selectedOptions).map(o=>o.value)
                update('stockCharacteristics', opts)
              }} className="min-h-[90px] rounded border px-3 py-2 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]">
                <option value="FRAGIL">FRÁGIL</option>
                <option value="PERECIVEL">PERECÍVEL</option>
              </select>
            </div>
          </div>
        </section>

        {errors.length > 0 && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 space-y-1">
            {errors.map(err => <div key={err}>{err}</div>)}
          </div>
        )}
      </form>
    </div>
  )
}

export default NewProductPage
