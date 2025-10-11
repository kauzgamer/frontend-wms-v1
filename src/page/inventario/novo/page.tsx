import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCreateInventory } from '@/lib/hooks/use-inventory'
import { createInventorySchema } from '@/lib/validation/inventory'
import { useToast } from '@/components/ui/toast-context'
import { useNavigate } from 'react-router-dom'
import { usePhysicalStructures } from '@/lib/hooks/use-physical-structures'
import { usePreviewAddresses } from '@/lib/hooks/use-addresses'
import type { PhysicalStructureSummary } from '@/lib/types/physical-structures'
import type { AddressPreview } from '@/lib/types/addresses'

type AddressInScope = {
  id: string
  depositoId: string
  estruturaFisicaId: string
  coordenadas: Array<{
    tipo: string
    nome: string
    abrev: string
    inicio: string | number
    fim: string | number
  }>
  situacao?: string
}

export default function NovoInventarioPage() {
  const [step, setStep] = useState(1)
  const [tipo, setTipo] = useState<'ENDERECO' | 'PRODUTO' | 'GERAL'>('ENDERECO')
  const [escopo, setEscopo] = useState<AddressInScope[]>([])
  const createMutation = useCreateInventory()
  const toast = useToast()
  const navigate = useNavigate()
  const identificadorRef = useRef<HTMLInputElement>(null)
  const descricaoRef = useRef<HTMLInputElement>(null)

  async function handleSubmit() {
    const raw = {
      identificador: identificadorRef.current?.value?.trim() || undefined,
      descricao: descricaoRef.current?.value?.trim() || '',
      tipo,
      escopo: tipo === 'ENDERECO' ? escopo : undefined,
    }
    const parsed = createInventorySchema.safeParse(raw)
    if (!parsed.success) {
      parsed.error.issues.forEach((i) => toast.show({ kind: 'error', message: i.message }))
      return
    }
    await createMutation.mutateAsync(parsed.data)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold" style={{ color: '#4a5c60' }}>Novo inventário</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/inventario')}>Cancelar</Button>
          <Button
            onClick={async () => {
              if (step < 5) {
                setStep((s) => Math.min(5, s + 1))
                return
              }
              try {
                await handleSubmit()
                toast.show({ kind: 'success', message: 'Inventário criado com sucesso' })
                navigate('/inventario')
              } catch (e: unknown) {
                const message = e instanceof Error ? e.message : 'Erro ao criar inventário'
                toast.show({ kind: 'error', message })
              }
            }}
            disabled={createMutation.isPending}
          >
            {step < 5 ? 'Próximo' : createMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <Stepper step={step} />

      <div className="border rounded-md p-4 bg-white">
        {step === 1 && (
          <SecaoInicio
            identificadorRef={identificadorRef}
            descricaoRef={descricaoRef}
            tipo={tipo}
            setTipo={setTipo}
          />
        )}
        {step === 2 && (
          <SecaoEscopo
            tipo={tipo}
            escopo={escopo}
            setEscopo={setEscopo}
          />
        )}
  {step === 3 && <SecaoCriterios />}
        {step === 4 && <SecaoIntegracao />}
        {step === 5 && <SecaoResumo />}
      </div>
    </div>
  )
}

function Stepper({ step }: { step: number }) {
  const steps = ['Início', 'Escopo', 'Critérios', 'Integração', 'Resumo']
  return (
    <div className="flex items-center gap-6">
      {steps.map((label, idx) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`size-8 rounded-full flex items-center justify-center font-semibold ${step > idx ? 'bg-cyan-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{idx + 1}</div>
          <div className={`${step >= idx + 1 ? 'text-cyan-600' : 'text-gray-400'}`}>{label}</div>
        </div>
      ))}
    </div>
  )
}

function SecaoInicio({ identificadorRef, descricaoRef, tipo, setTipo }: { identificadorRef: React.RefObject<HTMLInputElement | null>, descricaoRef: React.RefObject<HTMLInputElement | null>, tipo: 'ENDERECO' | 'PRODUTO' | 'GERAL', setTipo: (t: 'ENDERECO' | 'PRODUTO' | 'GERAL') => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2 text-cyan-600">INFORMAÇÕES INICIAIS</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-sm">Tipo</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm"><input type="radio" name="tipo" checked={tipo === 'ENDERECO'} onChange={() => setTipo('ENDERECO')} /> Por endereço</label>
              <label className="flex items-center gap-2 text-sm"><input type="radio" name="tipo" checked={tipo === 'PRODUTO'} onChange={() => setTipo('PRODUTO')} /> Por produto</label>
              <label className="flex items-center gap-2 text-sm"><input type="radio" name="tipo" checked={tipo === 'GERAL'} onChange={() => setTipo('GERAL')} /> Geral</label>
            </div>
          </div>
          <div>
            <label className="text-sm mb-2 block">Identificador</label>
            <input ref={identificadorRef} className="w-full border rounded px-3 py-2 text-sm bg-white" placeholder="Gerado automaticamente" defaultValue={Math.floor(Math.random()*1e8).toString().padStart(8,'0')} />
          </div>
          <div>
            <label className="text-sm mb-2 block">Descrição</label>
            <input ref={descricaoRef} className="w-full border rounded px-3 py-2 text-sm bg-white" placeholder="Descrição" defaultValue="" />
          </div>
        </div>
      </div>
    </div>
  )
}

function SecaoEscopo({ tipo, escopo, setEscopo }: { tipo: 'ENDERECO' | 'PRODUTO' | 'GERAL'; escopo: AddressInScope[]; setEscopo: (e: AddressInScope[]) => void }) {
  // Estado para seleção de escopo
  const [depositoSelecionado, setDepositoSelecionado] = useState<string>('')
  const [estruturaSelecionada, setEstruturaSelecionada] = useState<string>('')
  const [ranges, setRanges] = useState({
    ruaInicio: 'A',
    ruaFim: 'A',
    predioInicio: '',
    predioFim: '',
    nivelInicio: '',
    nivelFim: '',
  })
  const [enderecosGerados, setEnderecosGerados] = useState<AddressPreview[]>([])
  const [enderecosSelecionados, setEnderecosSelecionados] = useState<string[]>([])

  const depositos: Array<{ id: string; nome: string }> = [] // TODO: implementar hook para deposits
  const { data: estruturas } = usePhysicalStructures()
  const previewMutation = usePreviewAddresses()

  const handleDepositoChange = (dep: string) => {
    setDepositoSelecionado(dep)
    setEstruturaSelecionada('')
    setEnderecosGerados([])
    setEnderecosSelecionados([])
  }

  const handleEstruturaChange = (est: string) => {
    setEstruturaSelecionada(est)
    setEnderecosGerados([])
    setEnderecosSelecionados([])
  }

  const gerarPreview = async () => {
    if (!depositoSelecionado || !estruturaSelecionada) return
    const coordenadas = [
      { tipo: 'R', nome: 'Rua', abrev: 'R', inicio: ranges.ruaInicio, fim: ranges.ruaFim },
      { tipo: 'C', nome: 'Prédio', abrev: 'C', inicio: ranges.predioInicio ? Number(ranges.predioInicio) : 1, fim: ranges.predioFim ? Number(ranges.predioFim) : 1 },
      { tipo: 'N', nome: 'Nível', abrev: 'N', inicio: ranges.nivelInicio ? Number(ranges.nivelInicio) : 0, fim: ranges.nivelFim ? Number(ranges.nivelFim) : 0 },
    ]
    try {
      const result = await previewMutation.mutateAsync({ depositoId: depositoSelecionado, estruturaFisicaId: estruturaSelecionada, coordenadas })
      setEnderecosGerados(result)
    } catch (e) {
      console.error('Erro ao gerar preview', e)
    }
  }

  const adicionarSelecionados = () => {
    // Para o escopo, precisamos transformar AddressPreview em AddressInScope
    const selecionados = enderecosGerados
      .filter(addr => enderecosSelecionados.includes(addr.enderecoAbreviado))
      .map((_, index) => ({
        id: `scope-${Date.now()}-${index}`,
        depositoId: depositoSelecionado,
        estruturaFisicaId: estruturaSelecionada,
        coordenadas: [
          { tipo: 'R', nome: 'Rua', abrev: 'R', inicio: ranges.ruaInicio, fim: ranges.ruaFim },
          { tipo: 'C', nome: 'Prédio', abrev: 'C', inicio: ranges.predioInicio ? Number(ranges.predioInicio) : 1, fim: ranges.predioFim ? Number(ranges.predioFim) : 1 },
          { tipo: 'N', nome: 'Nível', abrev: 'N', inicio: ranges.nivelInicio ? Number(ranges.nivelInicio) : 0, fim: ranges.nivelFim ? Number(ranges.nivelFim) : 0 },
        ],
        situacao: 'ATIVO' as const,
      }))
    setEscopo([...escopo, ...selecionados])
    setEnderecosSelecionados([])
  }

  const removerDoEscopo = (id: string) => {
    setEscopo(escopo.filter(addr => addr.id !== id))
  }

  if (tipo !== 'ENDERECO') {
    return (
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-cyan-600">SELEÇÃO DO ESCOPO</h3>
        <div className="text-sm text-muted-foreground">Nenhum escopo necessário para o tipo selecionado.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-cyan-600">SELEÇÃO DO ESCOPO</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm mb-2 block">Depósito</label>
          <select
            value={depositoSelecionado}
            onChange={(e) => handleDepositoChange(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm bg-white"
          >
            <option value="">Selecione o depósito</option>
            {depositos?.map((dep) => (
              <option key={dep.id} value={dep.id}>{dep.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm mb-2 block">Estrutura Física</label>
          <select
            value={estruturaSelecionada}
            onChange={(e) => handleEstruturaChange(e.target.value)}
            disabled={!depositoSelecionado}
            className="w-full border rounded px-3 py-2 text-sm bg-white"
          >
            <option value="">Selecione a estrutura</option>
            {estruturas?.map((est: PhysicalStructureSummary) => (
              <option key={est.id} value={est.id}>{est.titulo}</option>
            ))}
          </select>
        </div>
      </div>

      {estruturaSelecionada && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm mb-2 block">Rua (A-Z)</label>
              <div className="flex gap-2">
                <input
                  value={ranges.ruaInicio}
                  onChange={(e) => setRanges({ ...ranges, ruaInicio: e.target.value.toUpperCase() })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <input
                  value={ranges.ruaFim}
                  onChange={(e) => setRanges({ ...ranges, ruaFim: e.target.value.toUpperCase() })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm mb-2 block">Prédio (número)</label>
              <div className="flex gap-2">
                <input
                  value={ranges.predioInicio}
                  onChange={(e) => setRanges({ ...ranges, predioInicio: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <input
                  value={ranges.predioFim}
                  onChange={(e) => setRanges({ ...ranges, predioFim: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm mb-2 block">Nível (número)</label>
              <div className="flex gap-2">
                <input
                  value={ranges.nivelInicio}
                  onChange={(e) => setRanges({ ...ranges, nivelInicio: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <input
                  value={ranges.nivelFim}
                  onChange={(e) => setRanges({ ...ranges, nivelFim: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <Button onClick={gerarPreview} disabled={previewMutation.isPending}>
            {previewMutation.isPending ? 'Gerando...' : 'Gerar Preview'}
          </Button>

          {enderecosGerados.length > 0 && (
            <div className="border rounded p-4">
              <h4 className="text-sm font-semibold mb-2">Endereços Gerados</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {enderecosGerados.map((addr) => (
                  <label key={addr.enderecoAbreviado} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={enderecosSelecionados.includes(addr.enderecoAbreviado)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEnderecosSelecionados([...enderecosSelecionados, addr.enderecoAbreviado])
                        } else {
                          setEnderecosSelecionados(enderecosSelecionados.filter(id => id !== addr.enderecoAbreviado))
                        }
                      }}
                    />
                    {addr.enderecoAbreviado}
                  </label>
                ))}
              </div>
              <Button onClick={adicionarSelecionados} className="mt-2" disabled={enderecosSelecionados.length === 0}>
                Adicionar Selecionados
              </Button>
            </div>
          )}
        </>
      )}

      {escopo.length > 0 && (
        <div className="border rounded p-4">
          <h4 className="text-sm font-semibold mb-2">Escopo Atual ({escopo.length} endereços)</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {escopo.map((addr: AddressInScope) => (
              <div key={addr.id} className="flex justify-between items-center text-sm">
                <span>{addr.coordenadas.map((c) => `${c.abrev}${c.inicio}`).join('-')}</span>
                <Button variant="outline" size="sm" onClick={() => removerDoEscopo(addr.id)}>Remover</Button>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={() => setEscopo([])} className="mt-2">Limpar Escopo</Button>
        </div>
      )}
    </div>
  )
}

function SecaoCriterios() {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-cyan-600">CRITÉRIOS DO INVENTÁRIO</h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="text-sm">Considerar estoque como primeira contagem</div>
          <label className="flex items-center gap-2 text-sm"><input type="radio" name="primeira" /> Sim</label>
          <label className="flex items-center gap-2 text-sm"><input type="radio" name="primeira" defaultChecked /> Não</label>
        </div>
        <div className="space-y-2">
          <div className="text-sm">Permite ao planejador escolher a contagem válida</div>
          <label className="flex items-center gap-2 text-sm"><input type="radio" name="validacao" /> Sim</label>
          <label className="flex items-center gap-2 text-sm"><input type="radio" name="validacao" defaultChecked /> Não</label>
        </div>
        <div className="space-y-2">
          <div className="text-sm">Atribuir operador</div>
          <label className="flex items-center gap-2 text-sm"><input type="radio" name="operador" defaultChecked /> Livre</label>
          <label className="flex items-center gap-2 text-sm"><input type="radio" name="operador" /> Não sequencial</label>
          <label className="flex items-center gap-2 text-sm"><input type="radio" name="operador" /> Restrito</label>
        </div>
      </div>
    </div>
  )
}

function SecaoIntegracao() {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-cyan-600">INTEGRAÇÃO</h3>
      <div className="text-sm text-muted-foreground">Integração com ERP a definir.</div>
    </div>
  )
}

function SecaoResumo() {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-cyan-600">RESUMO</h3>
      <div className="text-sm text-muted-foreground">Revise as informações antes de salvar.</div>
    </div>
  )
}

