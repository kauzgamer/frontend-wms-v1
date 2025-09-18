import { Link, useNavigate } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { HomeIcon } from 'lucide-react'
import { productCreateSchema, type ProductCreateForm } from '@/lib/validation/product'
import { useState } from 'react'
import { MoreHorizontal, Plus, Check, X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet'
import { useCreateProduct } from '@/lib/hooks/use-create-product'
import { useOrganization } from '@/lib/hooks/use-organization'

export function NewProductPage() {
  const navigate = useNavigate()
  const { data: org } = useOrganization()
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
    organizationId: undefined,
  })
  const [errors, setErrors] = useState<string[]>([])
  // SKUs locais enquanto produto não existe no backend (salvamos tudo junto futuramente ou após criação)
  interface DimensionsDraft { height?: number; width?: number; length?: number; weight?: number; layers?: number; pallet?: number; volumeM3?: number }
  interface TempSku { id: string; description: string; unitsPerSku: number; fractional: boolean; generatePickingLabel: boolean; barcodes: string[]; dimensions?: DimensionsDraft }
  const [skus, setSkus] = useState<TempSku[]>([])
  const [addingSku, setAddingSku] = useState(false)
  const [newSku, setNewSku] = useState<TempSku>({ id: '', description: '', unitsPerSku: 1, fractional: false, generatePickingLabel: false, barcodes: [], dimensions: undefined })
  const [openMenuSkuId, setOpenMenuSkuId] = useState<string | null>(null)
  const [editingSkuId, setEditingSkuId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<TempSku | null>(null)
  const [openSkuSheetId, setOpenSkuSheetId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'barcodes' | 'dimensions'>('barcodes')
  const [barcodeInput, setBarcodeInput] = useState('')

  function startAddSku() {
    setAddingSku(true)
    setNewSku({ id: '', description: '', unitsPerSku: 1, fractional: false, generatePickingLabel: false, barcodes: [], dimensions: undefined })
  }
  function cancelAddSku() { setAddingSku(false) }
  function confirmAddSku() {
    if (!newSku.description) return
    setSkus(prev => [...prev, { ...newSku, id: `tmp-${prev.length + 1}` }])
    setAddingSku(false)
  }
  function removeSku(id: string) {
    // if removing the one being edited reset editing state
    setSkus(prev => prev.filter(s => s.id !== id))
    if (editingSkuId === id) {
      setEditingSkuId(null)
      setEditDraft(null)
    }
  }

  function startEditSku(id: string) {
    const sku = skus.find(s => s.id === id)
    if (!sku) return
    setEditingSkuId(id)
    setEditDraft({ ...sku })
    setOpenMenuSkuId(null)
  }

  function cancelEditSku() {
    setEditingSkuId(null)
    setEditDraft(null)
  }

  function confirmEditSku() {
    if (!editingSkuId || !editDraft) return
    if (!editDraft.description) return
    setSkus(prev => prev.map(s => s.id === editingSkuId ? { ...s, ...editDraft } : s))
    setEditingSkuId(null)
    setEditDraft(null)
  }

  // Sheet helpers
  function openSheetForSku(id: string, tab: 'barcodes' | 'dimensions' = 'barcodes') {
    setOpenSkuSheetId(id)
    setActiveTab(tab)
    setOpenMenuSkuId(null)
  }

  function closeSheet() {
    setOpenSkuSheetId(null)
    setBarcodeInput('')
  }

  function addBarcode() {
    if (!barcodeInput.trim()) return
    setSkus(prev => prev.map(s => s.id === openSkuSheetId ? { ...s, barcodes: s.barcodes.includes(barcodeInput.trim()) ? s.barcodes : [...s.barcodes, barcodeInput.trim()] } : s))
    setBarcodeInput('')
  }

  function removeBarcode(code: string) {
    setSkus(prev => prev.map(s => s.id === openSkuSheetId ? { ...s, barcodes: s.barcodes.filter(b => b !== code) } : s))
  }

  function updateDimensions<K extends keyof DimensionsDraft>(key: K, value: number | undefined) {
    setSkus(prev => prev.map(s => {
      if (s.id !== openSkuSheetId) return s
      const dims: DimensionsDraft = { ...(s.dimensions || {}) }
      dims[key] = value
      // calculate volume if length/width/height present (assuming cm -> convert to m3)
      const { length, width, height } = dims
      if (length && width && height) {
        // if values are in cm convert to meters: /100 each then multiply
        dims.volumeM3 = (length/100) * (width/100) * (height/100)
      }
      return { ...s, dimensions: dims }
    }))
  }

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
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#334b52]">Organização</label>
              <select value={form.organizationId || ''} onChange={e=>update('organizationId', e.target.value || undefined)} className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]">
                <option value="">{org ? 'Selecionar organização' : 'Carregando...'}</option>
                {org && (
                  <option value={org.id}>{org.nome}</option>
                )}
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

        <section>
          <h2 className="text-xs font-semibold tracking-wide text-[#008bb1] mb-3">SKU</h2>
          <div className="mb-3">
            <button type="button" onClick={startAddSku} disabled={addingSku} className="h-10 bg-[#008bb1] hover:bg-[#007697] text-white text-sm font-medium rounded px-4 disabled:opacity-50 inline-flex items-center gap-1">
              <Plus className="size-4" /> Adicionar SKU
            </button>
          </div>
          <div className="border rounded shadow-sm overflow-visible bg-white relative">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-muted/40">
                <tr className="text-left">
                  <th className="w-16 border-b border-r border-gray-200"></th>
                  <th className="px-3 py-2 font-medium border-b border-r border-gray-200">Descrição</th>
                  <th className="px-3 py-2 font-medium border-b border-r border-gray-200">Quantidade de unidades</th>
                  <th className="px-3 py-2 font-medium text-center border-b border-r border-gray-200">Fracionado</th>
                  <th className="px-3 py-2 font-medium text-center border-b border-r border-gray-200">Gerar etiqueta de separação</th>
                  {/* removed last actions column */}
                </tr>
              </thead>
              <tbody>
                {addingSku && (
                  <tr className="bg-blue-50/20">
                    <td className="px-2 py-2 text-center border-b border-r border-gray-200">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={confirmAddSku}
                          disabled={!newSku.description.trim()}
                          className="text-emerald-600 enabled:hover:text-emerald-700 disabled:opacity-40"
                          title="Confirmar"
                        >
                          <Check className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelAddSku}
                          className="text-red-600 hover:text-red-700"
                          title="Cancelar"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-2 border-b border-r border-gray-200">
                      <input
                        autoFocus
                        value={newSku.description}
                        onChange={e=>setNewSku(s=>({...s, description: e.target.value}))}
                        onKeyDown={e=>{
                          if (e.key==='Enter') confirmAddSku()
                          if (e.key==='Escape') cancelAddSku()
                        }}
                        placeholder="Informe a descrição"
                        className="h-8 w-full border rounded px-2 text-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                      />
                    </td>
                    <td className="px-2 py-2 border-b border-r border-gray-200">
                      <input
                        type="number"
                        min={1}
                        value={newSku.unitsPerSku}
                        onChange={e=>setNewSku(s=>({...s, unitsPerSku: parseInt(e.target.value)||1}))}
                        onKeyDown={e=>{
                          if (e.key==='Enter') confirmAddSku()
                          if (e.key==='Escape') cancelAddSku()
                        }}
                        placeholder="Informe a quantidade"
                        className="h-8 w-full border rounded px-2 text-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                      />
                    </td>
                    <td className="px-2 py-2 text-center border-b border-r border-gray-200">
                      <input
                        type="checkbox"
                        checked={newSku.fractional}
                        onChange={e=>setNewSku(s=>({...s, fractional: e.target.checked}))}
                        title="Fracionado"
                      />
                    </td>
                    <td className="px-2 py-2 text-center border-b border-r border-gray-200">
                      <input
                        type="checkbox"
                        checked={newSku.generatePickingLabel}
                        onChange={e=>setNewSku(s=>({...s, generatePickingLabel: e.target.checked}))}
                        title="Gerar etiqueta de separação"
                      />
                    </td>
                    <td className="px-2 py-2 text-center border-b border-gray-200" />
                  </tr>
                )}
                {skus.map(sku => {
                  const isEditing = editingSkuId === sku.id
                  return (
                    <tr key={sku.id} className={`${isEditing ? 'bg-blue-50/30' : 'hover:bg-muted/30'}`}>
                      <td className="px-2 py-2 text-center border-b border-r border-gray-200 relative">
                        {isEditing ? (
                          <div className="flex items-center gap-2 justify-center">
                            <button type="button" onClick={confirmEditSku} className="text-emerald-600 hover:text-emerald-700" title="Confirmar edição"><Check className="size-4" /></button>
                            <button type="button" onClick={cancelEditSku} className="text-red-600 hover:text-red-700" title="Cancelar edição"><X className="size-4" /></button>
                          </div>
                        ) : (
                          <button type="button" onClick={()=>setOpenMenuSkuId(openMenuSkuId===sku.id?null:sku.id)} className="text-muted-foreground hover:text-foreground" title="Ações"><MoreHorizontal className="size-4" /></button>
                        )}
                        {openMenuSkuId===sku.id && !isEditing && (
                          <div className="absolute top-0 left-1 -translate-y-full -mt-2 z-20 w-56 bg-white border rounded shadow-lg text-sm py-1 text-left">
                            <button type="button" onClick={()=>startEditSku(sku.id)} className="block w-full text-left px-3 py-1.5 hover:bg-muted/40">Editar</button>
                            <button type="button" onClick={()=>openSheetForSku(sku.id, 'barcodes')} className="block w-full text-left px-3 py-1.5 hover:bg-muted/40">Código de barras e Dimensões</button>
                            <div className="h-px bg-gray-100 my-1" />
                            <button type="button" onClick={()=>{ removeSku(sku.id); setOpenMenuSkuId(null) }} className="block w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600">Excluir</button>
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-2 border-b border-r border-gray-200">
                        {isEditing ? (
                          <input value={editDraft?.description || ''} onChange={e=>setEditDraft(d=>d?{...d, description: e.target.value}:d)} className="h-8 w-full border rounded px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]" />
                        ) : sku.description}
                      </td>
                      <td className="px-2 py-2 border-b border-r border-gray-200">
                        {isEditing ? (
                          <input type="number" min={1} value={editDraft?.unitsPerSku || 1} onChange={e=>setEditDraft(d=>d?{...d, unitsPerSku: parseInt(e.target.value)||1}:d)} className="h-8 w-24 border rounded px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]" />
                        ) : sku.unitsPerSku}
                      </td>
                      <td className="px-2 py-2 text-center border-b border-r border-gray-200">
                        {isEditing ? (
                          <input type="checkbox" checked={editDraft?.fractional || false} onChange={e=>setEditDraft(d=>d?{...d, fractional: e.target.checked}:d)} />
                        ) : (sku.fractional ? 'Sim' : 'Não')}
                      </td>
                      <td className="px-2 py-2 text-center border-b border-r border-gray-200">
                        {isEditing ? (
                          <input type="checkbox" checked={editDraft?.generatePickingLabel || false} onChange={e=>setEditDraft(d=>d?{...d, generatePickingLabel: e.target.checked}:d)} />
                        ) : (sku.generatePickingLabel ? 'Sim' : 'Não')}
                      </td>
                      {/* removed trailing actions column */}
                    </tr>
                  )
                })}
                {!addingSku && skus.length===0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground border-b border-gray-200">Nenhum dado encontrado</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {errors.length > 0 && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 space-y-1">
            {errors.map(err => <div key={err}>{err}</div>)}
          </div>
        )}
      </form>
      {/* Sheet for Barcodes & Dimensions */}
      {openSkuSheetId && (
        <Sheet open onOpenChange={(open)=>{ if (!open) { closeSheet() } }}>
          <SheetContent side="right" className="sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>Códigos de barras e Dimensões</SheetTitle>
            </SheetHeader>
            <div className="px-4 flex flex-col gap-6 overflow-y-auto">
              {/* Tabs mimic */}
              <div className="flex border-b gap-4 text-sm">
                <button type="button" onClick={()=>setActiveTab('barcodes')} className={`pb-2 -mb-px border-b-2 ${activeTab==='barcodes'?'border-[#008bb1] text-[#008bb1]':'border-transparent text-muted-foreground hover:text-foreground'}`}>Códigos de barras</button>
                <button type="button" onClick={()=>setActiveTab('dimensions')} className={`pb-2 -mb-px border-b-2 ${activeTab==='dimensions'?'border-[#008bb1] text-[#008bb1]':'border-transparent text-muted-foreground hover:text-foreground'}`}>Dimensões</button>
              </div>
              {activeTab==='barcodes' && (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-[#334b52]">Adicionar código de barras</label>
                      <input value={barcodeInput} onChange={e=>setBarcodeInput(e.target.value)} placeholder="EAN / GTIN" className="h-9 w-full border rounded px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]" />
                    </div>
                    <button type="button" onClick={addBarcode} className="h-9 px-4 rounded bg-[#008bb1] text-white text-xs font-medium hover:bg-[#007697]">Adicionar</button>
                  </div>
                  <div className="border rounded divide-y">
                    {skus.find(s=>s.id===openSkuSheetId)?.barcodes.map(code => (
                      <div key={code} className="flex items-center justify-between px-3 py-2 text-sm">
                        <span>{code}</span>
                        <button type="button" onClick={()=>removeBarcode(code)} className="text-red-600 hover:text-red-700 text-xs font-medium">Remover</button>
                      </div>
                    ))}
                    {skus.find(s=>s.id===openSkuSheetId)?.barcodes.length===0 && (
                      <div className="px-3 py-6 text-center text-xs text-muted-foreground">Nenhum código adicionado</div>
                    )}
                  </div>
                </div>
              )}
              {activeTab==='dimensions' && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {(['length','width','height','weight','layers','pallet'] as (keyof DimensionsDraft)[]).map(key => {
                    const labelMap: Record<string,string> = { length:'Comprimento (cm)', width:'Largura (cm)', height:'Altura (cm)', weight:'Peso (kg)', layers:'Camadas', pallet:'Lastro' }
                    const sku = skus.find(s=>s.id===openSkuSheetId)
                    const value = sku?.dimensions?.[key]
                    return (
                      <div className="flex flex-col gap-1" key={key}>
                        <label className="text-xs font-medium text-[#334b52]">{labelMap[key]}</label>
                        <input type="number" value={value ?? ''} onChange={e=>updateDimensions(key, e.target.value===''?undefined:parseFloat(e.target.value))} className="h-9 w-full border rounded px-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]" />
                      </div>
                    )
                  })}
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-xs font-medium text-[#334b52]">Volume (m³)</label>
                    <input disabled value={(skus.find(s=>s.id===openSkuSheetId)?.dimensions?.volumeM3 ?? 0).toFixed(4)} className="h-9 w-full border rounded px-2 bg-muted/40 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
            <SheetFooter>
              <div className="flex gap-2 justify-end">
                <SheetClose asChild>
                  <button type="button" onClick={closeSheet} className="h-9 px-5 rounded border text-sm font-medium hover:bg-muted/40">Fechar</button>
                </SheetClose>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}

export default NewProductPage
