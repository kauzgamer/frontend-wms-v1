import { Link, useNavigate } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useToast } from '@/components/ui/toast-context'
import { useOrganization, useDeposits } from '@/lib/hooks/use-organization'
import { usePickingSettings, useUpsertPickingSettings } from '@/lib/hooks/use-picking-settings'
import { useEffect, useState } from 'react'

export default function PickingCaracteristicasEstoquePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { data: org } = useOrganization()
  const { data: deposits } = useDeposits()
  const [selectedDepositId, setSelectedDepositId] = useState<string | undefined>(undefined)
  useEffect(() => {
    if (deposits && selectedDepositId === undefined) {
      const principal = deposits.find((d) => d.principal)?.id
      setSelectedDepositId(principal)
    }
  }, [deposits, selectedDepositId])
  const { data, isLoading } = usePickingSettings({ organizationId: org?.id, depositId: selectedDepositId })
  const { mutateAsync, isPending } = useUpsertPickingSettings({ organizationId: org?.id, depositId: selectedDepositId })
  const disabled = isLoading || isPending || !org?.id

  async function handleChange(value: 'SIM' | 'NAO') {
    try {
      await mutateAsync({ requestAttributesOnSelect: value === 'SIM' })
      toast.show({ message: 'Configuração salva com sucesso', kind: 'success' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar configuração'
      toast.show({ message: msg, kind: 'error' })
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
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
              <Link to="/picking">Picking</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/picking/configuracao">Configuração</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Solicitar Características Picking</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>Características de estoque</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="deposito" className="text-sm" style={{ color: '#4a5c60' }}>Depósito:</label>
          <select
            id="deposito"
            className="h-9 rounded border px-2 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
            value={selectedDepositId ?? ''}
            onChange={(e) => setSelectedDepositId(e.target.value || undefined)}
            disabled={!deposits || disabled}
          >
            <option value="">Padrão da organização</option>
            {deposits?.map((d) => (
              <option key={d.id} value={d.id}>{d.nome}</option>
            ))}
          </select>
          <Button
            className="border text-[#008bb1] border-[#008bb1] bg-transparent hover:bg-cyan-50"
            onClick={() => navigate(-1)}
          >
            Voltar
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-6">
        <p className="text-xs" style={{ color: '#4a5c60' }}>
          As configurações abaixo, quando alteradas, serão aplicadas apenas para novos processos de picking.
        </p>
        <section className="space-y-2">
          <div className="text-sm font-medium" style={{ color: '#4a5c60' }}>
            Solicitar as características ao selecionar estoque
          </div>
          <div className="flex flex-col gap-3 mt-2" role="radiogroup" aria-label="Solicitar características">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="solicitar"
                checked={!!data?.requestAttributesOnSelect}
                onChange={() => handleChange('SIM')}
                disabled={disabled}
              />
              Sim, solicitar características
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="solicitar"
                checked={data ? data.requestAttributesOnSelect === false : false}
                onChange={() => handleChange('NAO')}
                disabled={disabled}
              />
              Não solicitar características
            </label>
          </div>
        </section>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="divide-y">
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="w-full text-left p-4 font-medium hover:bg-muted/40" style={{ color: '#0c9abe' }}>
              Características por categoria
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 text-sm text-muted-foreground">
              Configurações de características por categoria serão adicionadas aqui.
            </CollapsibleContent>
          </Collapsible>
          <Collapsible>
            <CollapsibleTrigger className="w-full text-left p-4 font-medium hover:bg-muted/40" style={{ color: '#0c9abe' }}>
              Características por produto
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 text-sm text-muted-foreground">
              Configurações de características por produto serão adicionadas aqui.
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Card>
    </div>
  )
}
