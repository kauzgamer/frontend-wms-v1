import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast-context';
import { useOrganization, useDeposits } from '@/lib/hooks/use-organization';
import { usePickingSettings, useUpsertPickingSettings } from '@/lib/hooks/use-picking-settings';
import { useEffect, useState } from 'react';

export default function ReservaEstoqueConfigPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: org } = useOrganization();
  const { data: deposits } = useDeposits();
  const [selectedDepositId, setSelectedDepositId] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (deposits && selectedDepositId === undefined) {
      const principal = deposits.find((d) => d.principal)?.id;
      setSelectedDepositId(principal);
    }
  }, [deposits, selectedDepositId]);
  const { data, isLoading } = usePickingSettings({ organizationId: org?.id, depositId: selectedDepositId });
  const { mutateAsync, isPending } = useUpsertPickingSettings({ organizationId: org?.id, depositId: selectedDepositId });
  const disabled = isLoading || isPending || !org?.id;

  async function setReserveMoment(value: 'IMEDIATO' | 'POSTERIOR') {
    try {
      await mutateAsync({ reserveMoment: value });
      toast.show({ message: 'Configuração salva com sucesso', kind: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar configuração';
      toast.show({ message: msg, kind: 'error' });
    }
  }

  async function setPartialPicking(value: boolean) {
    try {
      await mutateAsync({ allowPartialPicking: value });
      toast.show({ message: 'Configuração salva com sucesso', kind: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar configuração';
      toast.show({ message: msg, kind: 'error' });
    }
  }

  async function setAddressSelection(value: 'PICKING_FIRST' | 'STORAGE_FIRST' | 'ONLY_PICKING' | 'ONLY_STORAGE') {
    try {
      await mutateAsync({ addressSelection: value });
      toast.show({ message: 'Configuração salva com sucesso', kind: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar configuração';
      toast.show({ message: msg, kind: 'error' });
    }
  }

  async function setStockSorting(value: 'FEFO' | 'FIFO' | 'NONE') {
    try {
      await mutateAsync({ stockSorting: value });
      toast.show({ message: 'Configuração salva com sucesso', kind: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar configuração';
      toast.show({ message: msg, kind: 'error' });
    }
  }

  async function setSplit(value: 'BY_ITEM' | 'BY_ADDRESS' | 'BY_PRODUCT') {
    try {
      await mutateAsync({ splitMode: value });
      toast.show({ message: 'Configuração salva com sucesso', kind: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar configuração';
      toast.show({ message: msg, kind: 'error' });
    }
  }

  async function setLimits(values: { maxQtyPerTask?: number | null; maxLinesPerTask?: number | null }) {
    try {
      await mutateAsync(values);
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
            <BreadcrumbPage>Reserva de estoque</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>Reserva de estoque</h1>
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

      <Card className="p-4 space-y-8">
        <p className="text-xs" style={{ color: '#4a5c60' }}>
          As configurações abaixo, quando alteradas, serão aplicadas no processamento da seleção de estoque.
        </p>

        <section className="space-y-2">
          <div className="text-sm font-medium" style={{ color: '#4a5c60' }}>
            Prioridade de endereço (picking vs alto)
          </div>
          <div className="flex flex-col gap-3 mt-2" role="radiogroup" aria-label="Prioridade de endereço">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="addr"
                checked={data?.addressSelection === 'PICKING_FIRST'}
                onChange={() => setAddressSelection('PICKING_FIRST')}
                disabled={disabled}
              />
              Priorizar Picking; se não atender, buscar no Alto
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="addr"
                checked={data?.addressSelection === 'STORAGE_FIRST'}
                onChange={() => setAddressSelection('STORAGE_FIRST')}
                disabled={disabled}
              />
              Priorizar Alto; se não atender, buscar no Picking
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="addr"
                  checked={data?.addressSelection === 'ONLY_PICKING'}
                  onChange={() => setAddressSelection('ONLY_PICKING')}
                  disabled={disabled}
                />
                Somente Picking
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="addr"
                  checked={data?.addressSelection === 'ONLY_STORAGE'}
                  onChange={() => setAddressSelection('ONLY_STORAGE')}
                  disabled={disabled}
                />
                Somente Alto/Armazenagem
              </label>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <div className="text-sm font-medium" style={{ color: '#4a5c60' }}>
            Ordenação do estoque
          </div>
          <div className="flex flex-col gap-3 mt-2" role="radiogroup" aria-label="Ordenação do estoque">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="sort"
                checked={data?.stockSorting === 'FEFO'}
                onChange={() => setStockSorting('FEFO')}
                disabled={disabled}
              />
              FEFO (validade mais próxima primeiro)
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="sort"
                checked={data?.stockSorting === 'FIFO'}
                onChange={() => setStockSorting('FIFO')}
                disabled={disabled}
              />
              FIFO (mais antigo primeiro)
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="sort"
                checked={data?.stockSorting === 'NONE'}
                onChange={() => setStockSorting('NONE')}
                disabled={disabled}
              />
              Maior saldo primeiro
            </label>
          </div>
        </section>

        <section className="space-y-2">
          <div className="text-sm font-medium" style={{ color: '#4a5c60' }}>
            Reserva de estoque picking na seleção de estoque automática
          </div>
          <div className="flex flex-col gap-3 mt-2" role="radiogroup" aria-label="Momento da reserva">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="momento"
                checked={data?.reserveMoment === 'IMEDIATO'}
                onChange={() => setReserveMoment('IMEDIATO')}
                disabled={disabled}
              />
              Imediato, no processamento da seleção
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="momento"
                checked={data?.reserveMoment === 'POSTERIOR'}
                onChange={() => setReserveMoment('POSTERIOR')}
                disabled={disabled}
              />
              Posterior, na etapa de separação mobile
            </label>
          </div>
        </section>

        <section className="space-y-2">
          <div className="text-sm font-medium" style={{ color: '#4a5c60' }}>
            Permitir coleta parcial ao separar
          </div>
          <div className="flex flex-col gap-3 mt-2" role="radiogroup" aria-label="Coleta parcial">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="coleta"
                checked={!!data?.allowPartialPicking}
                onChange={() => setPartialPicking(true)}
                disabled={disabled}
              />
              Sim, até atingir o total solicitado
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="coleta"
                checked={data ? data.allowPartialPicking === false : false}
                onChange={() => setPartialPicking(false)}
                disabled={disabled}
              />
              Não, apenas coleta total
            </label>
          </div>
        </section>

        <section className="space-y-2">
          <div className="text-sm font-medium" style={{ color: '#4a5c60' }}>
            Divisão e limites da geração de tarefas
          </div>
          <div className="flex flex-col gap-3 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <label className="text-sm">Modo de split</label>
              <select
                className="h-9 rounded border px-2 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                value={data?.splitMode ?? 'BY_ADDRESS'}
                onChange={(e) =>
                  setSplit(
                    e.target.value as 'BY_ITEM' | 'BY_ADDRESS' | 'BY_PRODUCT'
                  )
                }
                disabled={disabled}
              >
                <option value="BY_ITEM">Por item</option>
                <option value="BY_ADDRESS">Por endereço</option>
                <option value="BY_PRODUCT">Por produto</option>
              </select>

              <div className="md:col-span-2" />

              <label className="text-sm">Qtd. máxima por tarefa</label>
              <input
                type="number"
                min={1}
                className="h-9 rounded border px-2 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                value={data?.maxQtyPerTask ?? ''}
                onChange={(e) => setLimits({ maxQtyPerTask: e.target.value ? Number(e.target.value) : null })}
                disabled={disabled}
              />

              <label className="text-sm">Máx. linhas por tarefa</label>
              <input
                type="number"
                min={1}
                className="h-9 rounded border px-2 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                value={data?.maxLinesPerTask ?? ''}
                onChange={(e) => setLimits({ maxLinesPerTask: e.target.value ? Number(e.target.value) : null })}
                disabled={disabled}
              />
            </div>
          </div>
        </section>
      </Card>
    </div>
  );
}
