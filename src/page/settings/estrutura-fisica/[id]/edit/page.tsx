import { Link, useNavigate, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, Check, X } from 'lucide-react'

type CoordKey = 'B' | 'R' | 'C' | 'N' | 'P' | 'A' | 'AP' // Bloco, Rua, Coluna, Nível, Palete, Andar, Apartamento

type Coord = {
  key: CoordKey
  nome: string
  abrevSugestoes?: string
}

const allCoords: Coord[] = [
  { key: 'B', nome: 'Bloco', abrevSugestoes: 'BL, B' },
  { key: 'R', nome: 'Rua', abrevSugestoes: 'RU, R' },
  { key: 'C', nome: 'Coluna', abrevSugestoes: 'CL, CLN' },
  { key: 'N', nome: 'Nível', abrevSugestoes: 'NI, N' },
  { key: 'P', nome: 'Palete', abrevSugestoes: 'PA, P' },
  { key: 'A', nome: 'Andar', abrevSugestoes: 'AN, ANZ' },
  { key: 'AP', nome: 'Apartamento', abrevSugestoes: 'AP, APT' },
]

export default function EditEstruturaFisicaPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Mock initial state based on example (Porta palete)
  // Todos marcados: Bloco (B), Rua (R), Coluna (C), Andar (A), Apartamento (AP)
  const defaultActive: CoordKey[] = ['B', 'R', 'C', 'A', 'AP']
  const [ativos, setAtivos] = useState<CoordKey[]>(defaultActive)
  const [customNome, setCustomNome] = useState<Record<CoordKey, string>>({} as Record<CoordKey, string>)
  const [customAbrev, setCustomAbrev] = useState<Record<CoordKey, string>>({} as Record<CoordKey, string>)
  const [editaNome, setEditaNome] = useState<Record<CoordKey, boolean>>({} as Record<CoordKey, boolean>)
  const [editaAbrev, setEditaAbrev] = useState<Record<CoordKey, boolean>>({} as Record<CoordKey, boolean>)
  const [usaLadoRua, setUsaLadoRua] = useState(false)

  const nomeEstrutura = useMemo(() => {
    if (id === 'porta-palete') return 'Porta palete'
    return 'Estrutura'
  }, [id])

  // Visualization mapping per structure (desktop labels)
  const vizLabelMap: Partial<Record<CoordKey, string>> = useMemo(() => {
    if (id === 'porta-palete') return { B: 'BLOCO', R: 'RUA', C: 'COLUNA', A: 'NIVEL', AP: 'PALETE' }
    return Object.fromEntries(allCoords.map(c => [c.key, c.nome.toUpperCase()])) as Partial<Record<CoordKey, string>>
  }, [id])

  // Suffix override for headings and mobile code letters (e.g., ANDAR (N), APARTAMENTO (P))
  const suffixOverride: Partial<Record<CoordKey, string>> = useMemo(() => {
    if (id === 'porta-palete') return { A: 'N', AP: 'P' }
    return {}
  }, [id])

  const visualizationKeys = ativos
  const visualizationLabels = visualizationKeys.map(k => vizLabelMap[k]!).filter(Boolean)

  function toggleAtivo(key: CoordKey) {
    setAtivos(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  function Switch({ checked, onChange, id, label }: { checked: boolean; onChange: (v: boolean) => void; id: string; label: string }) {
    return (
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9abe] ${checked ? 'bg-[#2f8ac9]' : 'bg-gray-300'}`}
      >
        <span
          className={`inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`}
        >
          {checked ? <Check className="size-3.5 text-[#2f8ac9]" /> : null}
        </span>
      </button>
    )
  }

  // Seed defaults similar to screenshot
  useEffect(() => {
    // Seed for Porta palete: names and abbreviations aligned to screenshot
    if (id === 'porta-palete') {
      setCustomNome({ C: 'COLUNA', A: 'NIVEL', AP: 'PALETE' } as Record<CoordKey, string>)
      setCustomAbrev({ A: 'N' } as Record<CoordKey, string>)
      setEditaNome({ C: true, A: true, AP: true } as Record<CoordKey, boolean>)
      setEditaAbrev({ A: true } as Record<CoordKey, boolean>)
    }
  }, [id])

  return (
    <div className="flex flex-col gap-4 p-6 pt-4">
      <div>
        <Breadcrumb>
          <BreadcrumbList className="bg-background rounded-md border px-3 py-2 shadow-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">Início</Link>
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
                <Link to="/settings/estrutura-fisica">Estrutura física</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Editar estrutura física</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>Editar estrutura física</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline">Restaurar padrão</Button>
            <Button variant="outline" onClick={() => navigate(-1)}><ChevronLeft className="size-4" />Voltar</Button>
            <Button className="bg-[#2f8ac9] hover:bg-[#277ab1] text-white">Salvar</Button>
          </div>
        </div>
      </div>

      <div className="text-xl font-semibold" style={{ color: '#4a5c60' }}>{nomeEstrutura}</div>

      {/* Visualization section at top */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center rounded bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-600">DESKTOP</span>
          </div>
          <div className="mt-2 text-[12px] font-semibold mb-2 text-gray-600">VISUALIZAÇÃO</div>
          <div className="flex flex-wrap gap-2">
            {visualizationLabels.map((label) => (
              <span key={label} className="inline-flex items-center rounded bg-green-600 text-white px-2.5 py-1 text-xs font-semibold">{label}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center rounded bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-600">DISPOSITIVOS MÓVEIS</span>
          </div>
          <div className="mt-2 text-[12px] font-semibold mb-2 text-gray-600">VISUALIZAÇÃO</div>
          <div className="flex items-center gap-2">
            {visualizationKeys.map((k) => (
              <span key={k} className="inline-flex size-6 items-center justify-center rounded-full bg-green-600 text-white text-xs" aria-hidden>{suffixOverride[k] ?? k}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Main content area with coordinate selection and configuration side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: Coordinate selection */}
        <div className="lg:col-span-1">
          <div className="text-sm font-medium mb-4">Indique as coordenadas utilizadas no seu endereço</div>
          <div className="flex flex-col gap-4">
            {(['B','R','C','A','AP'] as CoordKey[]).map(k => {
              const c = allCoords.find(cc => cc.key === k)!
              const id = `coord-${k}`
              const checked = ativos.includes(k)
              return (
                <div key={k} className="flex items-center justify-between gap-2">
                  <span className="text-sm">{c.nome}</span>
                  <Switch id={id} label={c.nome} checked={checked} onChange={() => toggleAtivo(k)} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Coordinate configuration */}
        <div className="lg:col-span-3 space-y-4">
          {(['B','R','C','A','AP'] as CoordKey[]).filter(k => ativos.includes(k)).map((k) => {
            const coord = allCoords.find(c => c.key === k)!
            const titulo = `${coord.nome.toUpperCase()} (${suffixOverride[k] ?? k})`
            const nomeVal = customNome[k] ?? ''
            const abrevVal = customAbrev[k] ?? ''
            const isColuna = k === 'C'
            const nomeSugestoes = k === 'B' ? 'Grupo; Outro nome' : k === 'R' ? 'Corredor; Outro nome' : k === 'C' ? 'Prédio; Módulo; Outro nome' : k === 'A' ? 'Altura; Nível; Outro nome' : k === 'AP' ? 'Vão; Outro nome' : 'Outro nome'
            const abrevSug = k === 'B' ? 'BL; BLO' : k === 'R' ? 'RU; RA' : k === 'C' ? 'CL; CLN' : k === 'A' ? 'AN; ANZ' : k === 'AP' ? 'AP; APT' : ''

            return (
              <div key={k} className="bg-white">
                <div className="px-4 py-2 border-b border-gray-200 text-sm font-semibold text-[#4a5c60]">{titulo}</div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Editar nomenclatura do sistema? */}
                  <div>
                    <div className="text-sm font-medium">Editar nomenclatura do sistema?</div>
                    <div className="text-xs text-muted-foreground mb-2">Outras opções: {nomeSugestoes}</div>
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input type="radio" name={`edita-nome-${k}`} checked={!!editaNome[k]} onChange={() => setEditaNome(p => ({ ...p, [k]: true }))} />
                        <span>Sim</span>
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input type="radio" name={`edita-nome-${k}`} checked={!editaNome[k]} onChange={() => setEditaNome(p => ({ ...p, [k]: false }))} />
                        <span>Não</span>
                      </label>
                    </div>
                    {editaNome[k] && (
                      <div className="mt-2 space-y-3">
                        <div className="relative">
                          <input
                            className="h-9 w-full rounded-md border pl-3 pr-8 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                            placeholder={coord.nome.toUpperCase()}
                            value={nomeVal}
                            onChange={(e) => setCustomNome(p => ({ ...p, [k]: e.target.value }))}
                          />
                          {nomeVal && (
                            <button type="button" aria-label="Limpar" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setCustomNome(p => ({ ...p, [k]: '' }))}>
                              <X className="size-4" />
                            </button>
                          )}
                        </div>
                        {isColuna && (
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={usaLadoRua} onChange={(e) => setUsaLadoRua(e.target.checked)} />
                            <span>Utilizo essa informação para definir o lado da rua</span>
                          </label>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Editar abreviatura do sistema? */}
                  <div>
                    <div className="text-sm font-medium">Editar abreviatura do sistema?</div>
                    <div className="text-xs text-muted-foreground mb-2">Outras opções: {abrevSug}</div>
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input type="radio" name={`edita-abrev-${k}`} checked={!!editaAbrev[k]} onChange={() => setEditaAbrev(p => ({ ...p, [k]: true }))} />
                        <span>Sim</span>
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input type="radio" name={`edita-abrev-${k}`} checked={!editaAbrev[k]} onChange={() => setEditaAbrev(p => ({ ...p, [k]: false }))} />
                        <span>Não</span>
                      </label>
                    </div>
                    { editaAbrev[k] && (
                      <div className="mt-2 space-y-3">
                        <div className="relative">
                          <input
                            className="h-9 w-full rounded-md border pl-3 pr-8 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                            placeholder={(coord.nome[0] ?? '').toUpperCase()}
                            value={abrevVal}
                            onChange={(e) => setCustomAbrev(p => ({ ...p, [k]: e.target.value }))}
                          />
                          {abrevVal && (
                            <button type="button" aria-label="Limpar" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setCustomAbrev(p => ({ ...p, [k]: '' }))}>
                              <X className="size-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ) }
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
