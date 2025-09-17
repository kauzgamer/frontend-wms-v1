import { Link, useNavigate } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { HomeIcon, ChevronLeft, Save } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface OrganizacaoForm {
  codigo: string
  nome: string
  cnpj: string
  ativo: boolean
  timezone: string
}

export function OrganizacaoIntegrationPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<OrganizacaoForm>({
    codigo: '',
    nome: '',
    cnpj: '',
    ativo: true,
    timezone: 'America/Sao_Paulo'
  })
  const [saving, setSaving] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  function update<K extends keyof OrganizacaoForm>(key: K, value: OrganizacaoForm[K]) {
    setForm(f => ({ ...f, [key]: value }))
    setTouched(t => ({ ...t, [key]: true }))
  }

  const errors: Partial<Record<keyof OrganizacaoForm, string>> = {}
  if (touched.codigo && !form.codigo) errors.codigo = 'Informe o código'
  if (touched.nome && !form.nome) errors.nome = 'Informe o nome'
  if (touched.cnpj && form.cnpj && !/^\d{14}$/.test(form.cnpj.replace(/\D/g,''))) errors.cnpj = 'CNPJ inválido'

  const hasErrors = Object.keys(errors).length > 0

  async function handleSave() {
    setTouched({ codigo: true, nome: true, cnpj: true, ativo: true, timezone: true })
    if (hasErrors) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    // success toast placeholder
    alert('Organização salva (mock).')
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
      <div className="flex items-start justify-between gap-4">
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
                  <Link to="/integration">Integração</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/integration/settings">Configurações de integração</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Organização</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="mt-4 text-2xl font-semibold leading-tight">Organização</h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">Configurações base da organização utilizadas na integração e sincronização de dados.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)} className="h-9"><ChevronLeft className="size-4" /> Voltar</Button>
          <Button onClick={handleSave} disabled={saving || hasErrors} className="h-9 bg-[#0c9abe] hover:bg-[#0a869d] text-white">
            <Save className="size-4 mr-1" /> {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-5 md:col-span-2 flex flex-col gap-5">
          <div>
            <h2 className="text-base font-semibold">Dados principais</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Identificação e status</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide">Código *</label>
              <input
                value={form.codigo}
                onChange={e => update('codigo', e.target.value.toUpperCase())}
                className={`h-9 rounded-md border px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe] ${errors.codigo ? 'border-red-500' : ''}`}
                placeholder="Ex: ORG01"
              />
              {errors.codigo && <span className="text-[11px] text-red-600">{errors.codigo}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide">Nome *</label>
              <input
                value={form.nome}
                onChange={e => update('nome', e.target.value)}
                className={`h-9 rounded-md border px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe] ${errors.nome ? 'border-red-500' : ''}`}
                placeholder="Razão social"
              />
              {errors.nome && <span className="text-[11px] text-red-600">{errors.nome}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide">CNPJ</label>
              <input
                value={form.cnpj}
                onChange={e => update('cnpj', e.target.value.replace(/\D/g,''))}
                className={`h-9 rounded-md border px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe] ${errors.cnpj ? 'border-red-500' : ''}`}
                placeholder="Somente números"
                maxLength={14}
              />
              {errors.cnpj && <span className="text-[11px] text-red-600">{errors.cnpj}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide">Time zone</label>
              <select
                value={form.timezone}
                onChange={e => update('timezone', e.target.value)}
                className="h-9 rounded-md border px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe] bg-background"
              >
                <option value="America/Sao_Paulo">America/Sao_Paulo (GMT-3)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="inline-flex items-center gap-2 text-xs font-medium">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={e => update('ativo', e.target.checked)}
                  className="size-4 rounded border"
                /> Ativo
              </label>
            </div>
          </div>
        </Card>
        <Card className="p-5 flex flex-col gap-5">
          <div>
            <h2 className="text-base font-semibold">Metadados</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Campos informativos sincronizados</p>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Última sincronização:</span><span>-</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Criado em:</span><span>-</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Atualizado em:</span><span>-</span></div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default OrganizacaoIntegrationPage
