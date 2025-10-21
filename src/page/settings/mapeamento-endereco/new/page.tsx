import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import type { CreateAddressMappingInput } from '@/lib/types/address-mapping';
import { useStockTypes } from '@/lib/hooks/use-stock-types';

export default function NovoMapeamentoEnderecoPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateAddressMappingInput>({
    descricao: '',
    categoriaProdutoId: undefined,
    produtoId: undefined,
    stockTypeId: undefined,
    tipoEstoque: 'Armazenagem',
    nivelEspecificacao: 'Genérico',
    situacao: 'ATIVO',
  });

  const { data: stockTypes } = useStockTypes({ situacao: 'ATIVO' });
  const stockTypeOptions = useMemo(() => (stockTypes ?? []).map(st => ({ id: st.id, label: st.descricao })), [stockTypes]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
      <div>
        <Breadcrumb>
          <BreadcrumbList className="bg-background rounded-md border px-3 py-2 shadow-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
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
                <Link to="/settings/mapeamento-endereco">Mapeamento de endereços</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Novo mapeamento de endereços</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>
          Novo mapeamento de endereços
        </h1>
        <div className="flex gap-2">
          <Link to="/settings/mapeamento-endereco" className="h-10 px-6 inline-flex items-center justify-center rounded border text-sm font-medium hover:bg-muted/40">
            Cancelar
          </Link>
          <Button className="bg-[#008bb1] hover:bg-[#007697] text-white h-10 px-6" onClick={() => navigate('/settings/mapeamento-endereco')}>
            Salvar
          </Button>
        </div>
      </div>

      <section>
        <div className="mb-2 text-xs font-semibold tracking-wide text-[#008bb1]">NOME DO MAPEAMENTO</div>
        <input
          value={form.descricao}
          onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
          placeholder="Identificação do mapeamento"
          className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe] w-[520px]"
        />
      </section>

      <section>
        <div className="mb-2 text-xs font-semibold tracking-wide text-[#008bb1]">O QUE</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#334b52]">Categoria de produto <span className="text-muted-foreground text-xs">(Opcional)</span></label>
            <select className="h-10 rounded border px-3 text-sm bg-white shadow-sm">
              <option>Selecione a categoria</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#334b52]">Produto <span className="text-muted-foreground text-xs">(Opcional)</span></label>
            <select className="h-10 rounded border px-3 text-sm bg-white shadow-sm">
              <option>Selecione o produto</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#334b52]">Tipo de estoque <span className="text-muted-foreground text-xs">(Opcional)</span></label>
            <select
              value={form.stockTypeId ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, stockTypeId: e.target.value || undefined }))}
              className="h-10 rounded border px-3 text-sm bg-white shadow-sm"
            >
              <option value="">Selecione o tipo de estoque</option>
              {stockTypeOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-2 text-xs font-semibold tracking-wide text-[#008bb1]">ONDE</div>
        <div className="flex justify-end">
          <Button className="border text-[#008bb1] border-[#008bb1] bg-transparent hover:bg-cyan-50">Adicionar prioridade</Button>
        </div>
      </section>
    </div>
  );
}
