import { Link, useNavigate, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, Check, X } from 'lucide-react'
import { usePhysicalStructure, useUpdatePhysicalStructure } from '@/lib/hooks/use-physical-structures'
import type { CoordKey as BackendCoordKey, UpdatePhysicalStructureInput, CoordConfig } from '@/lib/types/physical-structures'

type CoordKey = BackendCoordKey // string

// Definição de todos os tipos de coordenadas disponíveis
const ALL_COORD_TYPES = [
  { tipo: 'B', nome: 'Bloco', abrevSugestoes: 'BL, B' },
  { tipo: 'R', nome: 'Rua', abrevSugestoes: 'RU, R' },
  { tipo: 'C', nome: 'Coluna', abrevSugestoes: 'CL, CLN' },
  { tipo: 'A', nome: 'Andar', abrevSugestoes: 'AN, ANZ' },
  { tipo: 'AP', nome: 'Apartamento', abrevSugestoes: 'AP, APT' },
  { tipo: 'SE', nome: 'Setor', abrevSugestoes: 'SE, SET' },
  { tipo: 'Q', nome: 'Quadra', abrevSugestoes: 'Q, QD' },
  { tipo: 'AR', nome: 'Armário', abrevSugestoes: 'AR, ARM' },
  { tipo: 'CO', nome: 'Corredor', abrevSugestoes: 'CO, COR' },
  { tipo: 'G', nome: 'Gaveta', abrevSugestoes: 'G, GAV' },
  { tipo: 'E', nome: 'Estante', abrevSugestoes: 'E, EST' },
  { tipo: 'P', nome: 'Posição', abrevSugestoes: 'P, POS' },
] as const;

export default function EditEstruturaFisicaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const slug = id ?? ''

  // Backend data
  const { data } = usePhysicalStructure(slug)
  const updateMutation = useUpdatePhysicalStructure(slug)

  // Estados para coordenadas ativas
  const [ativos, setAtivos] = useState<Set<CoordKey>>(new Set())
  const [customNome, setCustomNome] = useState<Record<CoordKey, string>>({})
  const [customAbrev, setCustomAbrev] = useState<Record<CoordKey, string>>({})
  const [editaNome, setEditaNome] = useState<Record<CoordKey, boolean>>({})
  const [editaAbrev, setEditaAbrev] = useState<Record<CoordKey, boolean>>({})
  const [usaLadoRua, setUsaLadoRua] = useState(false)
  const [tituloServidor, setTituloServidor] = useState<string>('Estrutura')

  const nomeEstrutura = useMemo(() => {
    return tituloServidor
  }, [tituloServidor])

  // Coordenadas disponíveis para esta estrutura
  const coordenadasDisponiveis = useMemo(() => {
    if (!data) return []
    return Object.values(data.coords).map(coord => ({
      tipo: coord.tipo,
      nome: coord.nomeCustom || coord.nomePadrao,
      abrev: coord.abrevCustom || coord.abrevPadrao,
      ativo: coord.ativo
    }))
  }, [data])

  // Mapeamento para visualização
  const vizLabelMap: Partial<Record<CoordKey, string>> = useMemo(() => {
    return Object.fromEntries(
      coordenadasDisponiveis.map(c => [c.tipo, c.nome.toUpperCase()])
    )
  }, [coordenadasDisponiveis])

  // Sufixos para mobile (letras)
  const suffixOverride: Partial<Record<CoordKey, string>> = useMemo(() => {
    return Object.fromEntries(
      coordenadasDisponiveis.map(c => [c.tipo, c.abrev])
    )
  }, [coordenadasDisponiveis])

  const visualizationKeys = Array.from(ativos)
  const visualizationLabels = visualizationKeys.map(k => vizLabelMap[k]!).filter(Boolean)

  function toggleAtivo(key: BackendCoordKey) {
    setAtivos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
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

  // Load from backend
  useEffect(() => {
    if (!data) return
    setTituloServidor(data.titulo)

    // Encontrar coordenadas ativas
    const activeCoords = Object.values(data.coords)
      .filter(coord => coord.ativo)
      .map(coord => coord.tipo)
    setAtivos(new Set(activeCoords))

    // Carregar configurações customizadas
    const nome: Record<CoordKey, string> = {}
    const abrev: Record<CoordKey, string> = {}
    const eNome: Record<CoordKey, boolean> = {}
    const eAbrev: Record<CoordKey, boolean> = {}

    Object.values(data.coords).forEach((coord) => {
      eNome[coord.tipo] = coord.editarNome
      eAbrev[coord.tipo] = coord.editarAbrev
      if (coord.nomeCustom) nome[coord.tipo] = coord.nomeCustom
      if (coord.abrevCustom) abrev[coord.tipo] = coord.abrevCustom
    })

    setEditaNome(eNome)
    setEditaAbrev(eAbrev)
    setCustomNome(nome)
    setCustomAbrev(abrev)
    setUsaLadoRua(Boolean(data.colunaDefineLadoRua))
  }, [data])

  function buildPatchFromState(): UpdatePhysicalStructureInput {
    const patch: UpdatePhysicalStructureInput = {}

    // Construir objeto de coordenadas para atualizar
    const coordenadas: Record<string, Partial<CoordConfig>> = {}
    Array.from(ativos).forEach((key) => {
      coordenadas[key] = {
        ativo: true,
        editarNome: !!editaNome[key],
        editarAbrev: !!editaAbrev[key],
        ...(editaNome[key] && customNome[key] ? { nomeCustom: customNome[key] } : {}),
        ...(editaAbrev[key] && customAbrev[key] ? { abrevCustom: customAbrev[key] } : {}),
      }
    })

    // Marcar como inativas as coordenadas que não estão no conjunto ativo
    if (data) {
      Object.values(data.coords).forEach((coord) => {
        if (!ativos.has(coord.tipo)) {
          coordenadas[coord.tipo] = {
            ativo: false,
            editarNome: !!editaNome[coord.tipo],
            editarAbrev: !!editaAbrev[coord.tipo],
            ...(editaNome[coord.tipo] && customNome[coord.tipo] ? { nomeCustom: customNome[coord.tipo] } : {}),
            ...(editaAbrev[coord.tipo] && customAbrev[coord.tipo] ? { abrevCustom: customAbrev[coord.tipo] } : {}),
          }
        }
      })
    }

    patch.coordenadas = coordenadas
    patch.colunaDefineLadoRua = usaLadoRua
    return patch
  }

  async function onSalvar() {
    if (!slug) return
    const body = buildPatchFromState()
    try {
  const saved = await updateMutation.mutateAsync(body)
      // sync UI with server response
      setTituloServidor(saved.titulo)
    } catch (e) {
      console.error('Falha ao salvar estrutura:', e)
    }
  }

  async function onRestaurarPadrao() {
    if (!slug) return
    try {
      const saved = await updateMutation.mutateAsync({ restaurarPadrao: true })
      // refresh state from server values
      const activeCoords = Object.values(saved.coords)
        .filter(coord => coord.ativo)
        .map(coord => coord.tipo)
      setAtivos(new Set(activeCoords))

      // Reset custom configurations
      const resetNome: Record<CoordKey, string> = {}
      const resetAbrev: Record<CoordKey, string> = {}
      const resetENome: Record<CoordKey, boolean> = {}
      const resetEAbrev: Record<CoordKey, boolean> = {}

      Object.values(saved.coords).forEach((coord) => {
        resetENome[coord.tipo] = false
        resetEAbrev[coord.tipo] = false
        resetNome[coord.tipo] = ''
        resetAbrev[coord.tipo] = ''
      })

      setEditaNome(resetENome)
      setEditaAbrev(resetEAbrev)
      setCustomNome(resetNome)
      setCustomAbrev(resetAbrev)
      setUsaLadoRua(Boolean(saved.colunaDefineLadoRua))
      setTituloServidor(saved.titulo)
    } catch (e) {
      console.error('Falha ao restaurar padrão:', e)
    }
  }

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
            <Button variant="outline" onClick={onRestaurarPadrao} disabled={updateMutation.isPending}>Restaurar padrão</Button>
            <Button variant="outline" onClick={() => navigate(-1)}><ChevronLeft className="size-4" />Voltar</Button>
            <Button className="bg-[#2f8ac9] hover:bg-[#277ab1] text-white" onClick={onSalvar} disabled={updateMutation.isPending}>Salvar</Button>
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
            {ALL_COORD_TYPES.map(coord => {
              const id = `coord-${coord.tipo}`
              const checked = ativos.has(coord.tipo)
              const coordData = data?.coords[coord.tipo]

              // Só mostrar coordenadas que existem no backend para esta estrutura
              if (!coordData) return null

              return (
                <div key={coord.tipo} className="flex items-center justify-between gap-2">
                  <span className="text-sm">{coord.nome}</span>
                  <Switch id={id} label={coord.nome} checked={checked} onChange={() => toggleAtivo(coord.tipo)} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Coordinate configuration */}
        <div className="lg:col-span-3 space-y-4">
          {Array.from(ativos).map((tipo) => {
            const coord = ALL_COORD_TYPES.find(c => c.tipo === tipo)!
            const coordData = data?.coords[tipo]
            if (!coordData) return null

            const titulo = `${(coordData.nomeCustom || coordData.nomePadrao).toUpperCase()} (${coordData.abrevCustom || coordData.abrevPadrao})`
            const nomeVal = customNome[tipo] ?? ''
            const abrevVal = customAbrev[tipo] ?? ''
            const isColuna = tipo === 'C'

            return (
              <div key={tipo} className="bg-white">
                <div className="px-4 py-2 border-b border-gray-200 text-sm font-semibold text-[#4a5c60]">{titulo}</div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Editar nomenclatura do sistema? */}
                  <div>
                    <div className="text-sm font-medium">Editar nomenclatura do sistema?</div>
                    <div className="text-xs text-muted-foreground mb-2">Outras opções: Grupo; Outro nome</div>
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input type="radio" name={`edita-nome-${tipo}`} checked={!!editaNome[tipo]} onChange={() => setEditaNome(p => ({ ...p, [tipo]: true }))} />
                        <span>Sim</span>
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input type="radio" name={`edita-nome-${tipo}`} checked={!editaNome[tipo]} onChange={() => setEditaNome(p => ({ ...p, [tipo]: false }))} />
                        <span>Não</span>
                      </label>
                    </div>
                    {editaNome[tipo] && (
                      <div className="mt-2 space-y-3">
                        <div className="relative">
                          <input
                            className="h-9 w-full rounded-md border pl-3 pr-8 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                            placeholder={coordData.nomePadrao.toUpperCase()}
                            value={nomeVal}
                            onChange={(e) => setCustomNome(p => ({ ...p, [tipo]: e.target.value }))}
                          />
                          {nomeVal && (
                            <button type="button" aria-label="Limpar" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setCustomNome(p => ({ ...p, [tipo]: '' }))}>
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
                    <div className="text-xs text-muted-foreground mb-2">Outras opções: {coord.abrevSugestoes}</div>
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input type="radio" name={`edita-abrev-${tipo}`} checked={!!editaAbrev[tipo]} onChange={() => setEditaAbrev(p => ({ ...p, [tipo]: true }))} />
                        <span>Sim</span>
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input type="radio" name={`edita-abrev-${tipo}`} checked={!editaAbrev[tipo]} onChange={() => setEditaAbrev(p => ({ ...p, [tipo]: false }))} />
                        <span>Não</span>
                      </label>
                    </div>
                    { editaAbrev[tipo] && (
                      <div className="mt-2 space-y-3">
                        <div className="relative">
                          <input
                            className="h-9 w-full rounded-md border pl-3 pr-8 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                            placeholder={coordData.abrevPadrao}
                            value={abrevVal}
                            onChange={(e) => setCustomAbrev(p => ({ ...p, [tipo]: e.target.value }))}
                          />
                          {abrevVal && (
                            <button type="button" aria-label="Limpar" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setCustomAbrev(p => ({ ...p, [tipo]: '' }))}>
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
