import { Link, useNavigate, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft } from 'lucide-react'

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
  const defaultActive: CoordKey[] = ['R', 'C', 'N', 'P']
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

  const visualization = ativos
  const deviceIcons = ['D1', 'D2', 'D3', 'D4', 'D5'] // placeholders

  function toggleAtivo(key: CoordKey) {
    setAtivos(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  // Seed defaults similar to screenshot
  useEffect(() => {
    setCustomNome({ C: 'COLUNA', N: 'NIVEL', P: 'PALETE' } as Record<CoordKey, string>)
    setCustomAbrev({ N: 'N' } as Record<CoordKey, string>)
    setEditaNome({ C: true, N: true, P: true } as Record<CoordKey, boolean>)
    setEditaAbrev({ N: true } as Record<CoordKey, boolean>)
  }, [])

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

      {/* Top visualization row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-3 lg:col-span-2">
          <div className="text-xs font-semibold mb-2 text-muted-foreground">VISUALIZAÇÃO</div>
          <div className="flex flex-wrap gap-2">
            {visualization.map((k) => (
              <span key={k} className="inline-flex items-center rounded-full bg-[#2f8ac9]/10 text-[#2f8ac9] px-2.5 py-1 text-xs font-semibold">{allCoords.find(c=>c.key===k)?.nome.toUpperCase()}</span>
            ))}
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-xs font-semibold mb-2 text-muted-foreground">DISPOSITIVOS MÓVEIS</div>
          <div className="flex items-center gap-2">
            {deviceIcons.map((d) => (
              <span key={d} className="inline-flex size-6 items-center justify-center rounded-full border text-xs" aria-hidden>{d}</span>
            ))}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">VISUALIZAÇÃO</div>
        </Card>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: coordinate selection */}
        <Card className="p-3 lg:col-span-1">
          <div className="text-sm font-medium mb-2">Indique as coordenadas utilizadas no seu endereço</div>
          <div className="flex flex-col gap-2">
            {allCoords.map(c => (
              <label key={c.key} className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={ativos.includes(c.key)} onChange={() => toggleAtivo(c.key)} />
                <span>{c.nome}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Right: settings per active coordinate */}
        <div className="lg:col-span-4 space-y-8">
          {ativos.map((k) => {
            const coord = allCoords.find(c => c.key === k)!
            const titulo = `${coord.nome.toUpperCase()} (${k})`
            const nomeVal = customNome[k] ?? ''
            const abrevVal = customAbrev[k] ?? ''
            const isRua = k === 'R'

            return (
              <Card key={k} className="p-0 overflow-hidden">
                <div className="px-4 py-2 border-b text-sm font-semibold text-[#4a5c60]">{titulo}</div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Editar nomenclatura do sistema? */}
                  <div>
                    <div className="text-sm font-medium">Editar nomenclatura do sistema?</div>
                    <div className="text-xs text-muted-foreground mb-2">Outras opções: {coord.nome === 'Coluna' ? 'Prédio, Módulo, Outro nome.' : 'Outros: opções, Nível, Outro nome.'}</div>
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
                      <div className="mt-2">
                        <input
                          className="h-9 w-full rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                          placeholder={coord.nome.toUpperCase()}
                          value={nomeVal}
                          onChange={(e) => setCustomNome(p => ({ ...p, [k]: e.target.value }))}
                        />
                        {isRua && (
                          <label className="mt-3 inline-flex items-center gap-2 text-sm">
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
                    <div className="text-xs text-muted-foreground mb-2">Outras opções: {coord.abrevSugestoes ?? ''}</div>
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
                    {editaAbrev[k] && (
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          className="h-9 w-full rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                          placeholder={(coord.nome[0] ?? '').toUpperCase()}
                          value={abrevVal}
                          onChange={(e) => setCustomAbrev(p => ({ ...p, [k]: e.target.value }))}
                        />
                        {k === 'N' && (
                          <input
                            className="h-9 w-full rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                            placeholder="N"
                            value={abrevVal}
                            onChange={(e) => setCustomAbrev(p => ({ ...p, [k]: e.target.value }))}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
