import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCreateInventory } from '@/lib/hooks/use-inventory'
import { createInventorySchema } from '@/lib/validation/inventory'
import { useToast } from '@/components/ui/toast-context'
import { useNavigate } from 'react-router-dom'

export default function NovoInventarioPage() {
  const [step, setStep] = useState(1)
  const [tipo, setTipo] = useState<'ENDERECO' | 'PRODUTO' | 'GERAL'>('ENDERECO')
  const [escopo, setEscopo] = useState<Record<string, unknown> | undefined>(undefined)
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

function SecaoEscopo({ tipo, escopo, setEscopo }: { tipo: 'ENDERECO' | 'PRODUTO' | 'GERAL'; escopo: Record<string, unknown> | undefined; setEscopo: (e: Record<string, unknown> | undefined) => void }) {
  // Um editor mínimo: quando tipo = ENDERECO, permitir adicionar um range simples para coordenadas
  const [ruaInicio, setRuaInicio] = useState('A')
  const [ruaFim, setRuaFim] = useState('A')
  const [predioInicio, setPredioInicio] = useState<number | ''>('')
  const [predioFim, setPredioFim] = useState<number | ''>('')
  const [nivelInicio, setNivelInicio] = useState<number | ''>('')
  const [nivelFim, setNivelFim] = useState<number | ''>('')

  function addRange() {
    if (tipo !== 'ENDERECO') {
      setEscopo(undefined)
      return
    }
    // Monta estrutura de escopo compatível com backend como exemplo
    const novoEscopo = {
      estruturaFisicaId: 'porta-palete',
      coordenadas: [
        { tipo: 'R', nome: 'Rua', abrev: 'R', inicio: ruaInicio || 'A', fim: ruaFim || 'A' },
        { tipo: 'C', nome: 'Prédio', abrev: 'C', inicio: predioInicio === '' ? 1 : Number(predioInicio), fim: predioFim === '' ? 1 : Number(predioFim) },
        { tipo: 'N', nome: 'Nível', abrev: 'N', inicio: nivelInicio === '' ? 0 : Number(nivelInicio), fim: nivelFim === '' ? 0 : Number(nivelFim) },
      ],
    }
    setEscopo(novoEscopo as unknown as Record<string, unknown>)
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-cyan-600">SELEÇÃO DO ESCOPO</h3>

      {tipo === 'ENDERECO' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm mb-2 block">Rua (A-Z)</label>
              <div className="flex gap-2">
                <input value={ruaInicio} onChange={(e) => setRuaInicio(e.target.value.toUpperCase())} className="w-full border rounded px-3 py-2 text-sm" />
                <input value={ruaFim} onChange={(e) => setRuaFim(e.target.value.toUpperCase())} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm mb-2 block">Prédio (número)</label>
              <div className="flex gap-2">
                <input value={predioInicio} onChange={(e) => setPredioInicio(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border rounded px-3 py-2 text-sm" />
                <input value={predioFim} onChange={(e) => setPredioFim(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm mb-2 block">Nível (número)</label>
              <div className="flex gap-2">
                <input value={nivelInicio} onChange={(e) => setNivelInicio(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border rounded px-3 py-2 text-sm" />
                <input value={nivelFim} onChange={(e) => setNivelFim(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={addRange}>Aplicar escopo</Button>
            <Button type="button" variant="outline" onClick={() => setEscopo(undefined)}>Limpar</Button>
          </div>

          <div className="border rounded">
            <div className="p-3 text-sm text-muted-foreground">Escopo atual</div>
            <pre className="p-3 border-t text-xs whitespace-pre-wrap">{JSON.stringify(escopo ?? {}, null, 2)}</pre>
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Nenhum escopo necessário para o tipo selecionado.</div>
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

