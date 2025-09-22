import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { HomeIcon } from 'lucide-react'
import { useToast } from '@/components/ui/toast-context'
import { useCreateSupplier } from '@/lib/hooks/use-create-supplier'

type PersonType = 'PF' | 'PJ' | 'FOREIGN'

const BRAZIL_UF = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
]

export default function NewSupplierPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { mutateAsync, isPending } = useCreateSupplier()

  const [country, setCountry] = useState('BR')
  const [person, setPerson] = useState<PersonType>('PJ')
  const [cnpj, setCnpj] = useState('')
  const [name, setName] = useState('')
  const [uf, setUf] = useState('')
  const [stateRegistration, setStateRegistration] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  function validate(): boolean {
    const errs: string[] = []
    if (country !== 'BR') {
      errs.push('No momento, apenas fornecedores do Brasil são suportados.')
    }
    if (person !== 'PJ') {
      errs.push('No momento, apenas Pessoa Jurídica é suportada.')
    }
    const onlyDigits = cnpj.replace(/\D/g, '')
    if (!onlyDigits || onlyDigits.length !== 14) {
      errs.push('Informe um CNPJ válido com 14 dígitos (somente números).')
    }
    if (!name.trim()) errs.push('Informe a razão social.')
    if (!uf) errs.push('Selecione o estado (UF).')
    setErrors(errs)
    return errs.length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    try {
      await mutateAsync({ cnpj: cnpj.replace(/\D/g, ''), name: name.trim(), uf, stateRegistration: stateRegistration || undefined, active: true })
      toast.show({ message: 'Fornecedor criado com sucesso', kind: 'success' })
      navigate('/settings/fornecedor')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar fornecedor'
      setErrors([msg])
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
                <Link to="/settings/fornecedor">Cadastro de fornecedor</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Novo fornecedor</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>Novo fornecedor</h1>
          <div className="flex gap-2">
            <Link to="/settings/fornecedor" className="h-10 px-6 inline-flex items-center justify-center rounded border text-sm font-medium hover:bg-muted/40">Cancelar</Link>
            <button type="submit" disabled={isPending} className="h-10 px-6 inline-flex items-center justify-center rounded bg-[#008bb1] text-white text-sm font-medium hover:bg-[#007697] disabled:opacity-50">{isPending ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </div>

        <section>
          <h2 className="text-xs font-semibold tracking-wide text-[#008bb1] mb-4">DADOS PRINCIPAIS</h2>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className="flex flex-col gap-1 md:col-span-1">
              <label className="text-sm font-medium text-[#334b52]">País</label>
              <select value={country} onChange={e=>setCountry(e.target.value)} className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]">
                <option value="BR">Brasil</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-[#334b52]">Tipo de fornecedor</label>
              <div className="flex items-center gap-6 text-sm">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input type="radio" name="ptype" checked={person==='PF'} onChange={()=>setPerson('PF')} />
                  Pessoa física
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input type="radio" name="ptype" checked={person==='PJ'} onChange={()=>setPerson('PJ')} />
                  Pessoa jurídica
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input type="radio" name="ptype" checked={person==='FOREIGN'} onChange={()=>setPerson('FOREIGN')} />
                  Estrangeiro
                </label>
              </div>
              {(person !== 'PJ' || country !== 'BR') && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 w-fit">No momento, o cadastro suporta apenas Pessoa Jurídica do Brasil.</div>
              )}
            </div>

            {/* Linha de campos */}
            <div className="flex flex-col gap-1 md:col-span-1">
              <label className="text-sm font-medium text-[#334b52]">CNPJ</label>
              <input value={cnpj} onChange={e=>setCnpj(e.target.value)} placeholder="Informe somente os números" className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]" />
            </div>
            <div className="flex flex-col gap-1 md:col-span-1">
              <label className="text-sm font-medium text-[#334b52]">Razão social</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Informe o nome da empresa" className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]" />
            </div>
            <div className="flex flex-col gap-1 md:col-span-1">
              <label className="text-sm font-medium text-[#334b52]">Estado</label>
              <select value={uf} onChange={e=>setUf(e.target.value)} className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]">
                <option value="">Selecione o estado</option>
                {BRAZIL_UF.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1 md:col-span-1">
              <label className="text-sm font-medium text-[#334b52]">Inscrição estadual <span className="text-muted-foreground text-xs font-normal">(Opcional)</span></label>
              <input value={stateRegistration} onChange={e=>setStateRegistration(e.target.value)} placeholder="Não informada" className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]" />
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
