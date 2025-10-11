import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useCreateInventory } from '@/lib/hooks/use-inventory'
import { createInventorySchema } from '@/lib/validation/inventory'
import { useToast } from '@/components/ui/toast-context'
import { useNavigate } from 'react-router-dom'

export default function NovoInventarioPage() {
  const [step, setStep] = useState(1)
  const createMutation = useCreateInventory()
  const toast = useToast()
  const navigate = useNavigate()
  const identificadorRef = useRef<HTMLInputElement>(null)
  const descricaoRef = useRef<HTMLInputElement>(null)
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
              // Salvar
              const raw = {
                identificador: identificadorRef.current?.value?.trim() || undefined,
                descricao: descricaoRef.current?.value?.trim() || '',
              }
              const parsed = createInventorySchema.safeParse(raw)
              if (!parsed.success) {
                parsed.error.issues.forEach((i) => toast.show({ kind: 'error', message: i.message }))
                return
              }
              try {
                await createMutation.mutateAsync(parsed.data)
                toast.show({ kind: 'success', message: 'Inventário criado com sucesso' })
                navigate('/inventario')
              } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : 'Erro ao criar inventário'
                toast.show({ kind: 'error', message: msg })
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
        {step === 1 && <SecaoInicio identificadorRef={identificadorRef} descricaoRef={descricaoRef} />}
        {step === 2 && <SecaoEscopo />}
        {step === 3 && <SecaoCritérios />}
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

function SecaoInicio({ identificadorRef, descricaoRef }: { identificadorRef: React.RefObject<HTMLInputElement | null>, descricaoRef: React.RefObject<HTMLInputElement | null> }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2 text-cyan-600">INFORMAÇÕES INICIAIS</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-sm">Tipo</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm"><input type="radio" name="tipo" defaultChecked /> Por endereço</label>
              <label className="flex items-center gap-2 text-sm"><input type="radio" name="tipo" /> Por produto</label>
              <label className="flex items-center gap-2 text-sm"><input type="radio" name="tipo" /> Geral</label>
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

function SecaoEscopo() {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-cyan-600">SELEÇÃO DOS ENDEREÇOS</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm mb-2 block">Depósito</label>
          <select className="w-full border rounded px-3 py-2 text-sm bg-gray-100" disabled>
            <option>Principal</option>
          </select>
        </div>
        <div>
          <label className="text-sm mb-2 block">Endereços</label>
          <select className="w-full border rounded px-3 py-2 text-sm bg-white">
            <option>Selecione o endereço</option>
          </select>
        </div>
      </div>
      <button className="border rounded px-3 py-2 text-sm">+ Adicionar</button>
      <div className="border rounded">
        <div className="p-3 text-sm text-muted-foreground">Endereços adicionados</div>
        <div className="p-3 border-t text-sm">Nenhum</div>
      </div>
    </div>
  )
}

function SecaoCritérios() {
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
