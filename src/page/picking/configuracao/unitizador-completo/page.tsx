import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/components/ui/toast-context';
import { useOrganization, useDeposits } from '@/lib/hooks/use-organization';
import { usePickingSettings, useUpsertPickingSettings } from '@/lib/hooks/use-picking-settings';

export default function UnitizadorCompletoConfigPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: org } = useOrganization();
  const { data: deposits } = useDeposits();
  const principalDepositId = deposits?.find((d) => d.principal)?.id;
  const { data, isLoading } = usePickingSettings({ organizationId: org?.id, depositId: principalDepositId });
  const { mutateAsync, isPending } = useUpsertPickingSettings({ organizationId: org?.id, depositId: principalDepositId });
  const disabled = isLoading || isPending || !org?.id;

  async function handleChange(value: 'FALTANTE' | 'UNITIZADOR') {
    try {
      await mutateAsync({ replenishMode: value });
      toast.show({ message: 'Configuração salva com sucesso', kind: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar configuração';
      toast.show({ message: msg, kind: 'error' });
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
            <BreadcrumbPage>Unitizador completo</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>Unitizador completo</h1>
        <Button
          className="border text-[#008bb1] border-[#008bb1] bg-transparent hover:bg-cyan-50"
          onClick={() => navigate(-1)}
        >
          Voltar
        </Button>
      </div>

      <Card className="p-4">
        <p className="text-xs mb-4" style={{ color: '#4a5c60' }}>
          As configurações abaixo, quando alteradas, serão aplicadas apenas para novos processos de reabastecimento.
        </p>

        <div className="space-y-2">
          <div className="text-sm font-medium" style={{ color: '#4a5c60' }}>
            Forma de reabastecer picking
          </div>
          <div className="flex flex-col gap-3 mt-2" role="radiogroup" aria-label="Forma de reabastecer">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="modo-reabastecer"
                checked={data?.replenishMode === 'FALTANTE'}
                onChange={() => handleChange('FALTANTE')}
                disabled={disabled}
              />
              Repor quantidade faltante
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="modo-reabastecer"
                checked={data?.replenishMode === 'UNITIZADOR'}
                onChange={() => handleChange('UNITIZADOR')}
                disabled={disabled}
              />
              Repor com unitizador completo
            </label>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="divide-y">
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="w-full text-left p-4 font-medium hover:bg-muted/40" style={{ color: '#0c9abe' }}>
              Reabastecimento por categoria
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 text-sm text-muted-foreground">
              Configurações por categoria serão adicionadas aqui.
            </CollapsibleContent>
          </Collapsible>
          <Collapsible>
            <CollapsibleTrigger className="w-full text-left p-4 font-medium hover:bg-muted/40" style={{ color: '#0c9abe' }}>
              Reabastecimento por produto
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 text-sm text-muted-foreground">
              Configurações por produto serão adicionadas aqui.
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Card>
    </div>
  );
}
