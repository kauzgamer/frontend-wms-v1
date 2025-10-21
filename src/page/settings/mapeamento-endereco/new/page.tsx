import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useRef, useState } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast-context';
import type { CreateAddressMappingInput } from '@/lib/types/address-mapping';
import { useStockTypes } from '@/lib/hooks/use-stock-types';
import { useProducts } from '@/lib/hooks/use-products';
import { useProductCategoriesForSelect } from '@/lib/hooks/use-product-categories-for-select';
import { useAddressGroups } from '@/lib/hooks/use-address-groups';
import { useCreateAddressMapping } from '@/lib/hooks/use-address-mapping';

export default function NovoMapeamentoEnderecoPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateAddressMappingInput>({
    descricao: '',
    categoriaProdutoId: undefined,
    produtoId: undefined,
    stockTypeId: undefined,
    // tipoEstoque e nivelEspecificacao são opcionais e têm defaults no backend
    // tipoEstoque: 'ARMAZENAGEM',
    nivelEspecificacao: 'GENERICO',
    situacao: 'ATIVO',
  });

  const { data: stockTypes } = useStockTypes({ situacao: 'ATIVO' });
  const stockTypeOptions = useMemo(() => (stockTypes ?? []).map(st => ({ id: st.id, label: st.descricao })), [stockTypes]);
  const { data: products } = useProducts();
  const productOptions = useMemo(() => (products ?? []).map(p => ({ id: p.id, label: `${p.sku ?? ''} ${p.name}`.trim() })), [products]);
  const { data: categories } = useProductCategoriesForSelect();
  const categoryOptions = useMemo(() => (categories ?? []).map(c => ({ id: c.id, label: c.descricao })), [categories]);
  const { data: addressGroups } = useAddressGroups({ page: 1, limit: 100 });
  const addressGroupOptions = useMemo(() => (addressGroups ?? []).map(g => ({ id: g.id, label: g.name })), [addressGroups]);

  const [priorities, setPriorities] = useState<Array<{ prioridade: number; groupId: string }>>([]);
  function addPriority() {
    // adiciona primeira opção por padrão se existir
    const first = addressGroupOptions[0];
    if (!first) return;
    setPriorities((prev) => {
      const next = prev.length + 1;
      return [...prev, { prioridade: next, groupId: first.id }];
    });
  }

  const toast = useToast();
  const { mutateAsync: createMapping, isPending } = useCreateAddressMapping();
  const descricaoRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    try {
      if (!form.descricao || !form.descricao.trim()) {
        toast.show({ kind: 'error', message: 'Descrição é obrigatória' });
        descricaoRef.current?.focus();
        return;
      }
      const payload: CreateAddressMappingInput = {
        descricao: form.descricao.trim(),
        categoriaProdutoId: form.categoriaProdutoId || undefined,
        produtoId: form.produtoId || undefined,
        stockTypeId: form.stockTypeId || undefined,
        // Se desejar enviar tipoEstoque, mapear aqui. Vamos omitir para usar default 'ARMAZENAGEM'.
        nivelEspecificacao: form.nivelEspecificacao ?? 'GENERICO',
        situacao: form.situacao ?? 'ATIVO',
        prioridades: priorities.length ? priorities : undefined,
      };

      await createMapping(payload);
      toast.show({ kind: 'success', message: 'Mapeamento criado com sucesso' });
      navigate('/settings/mapeamento-endereco');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar mapeamento';
      toast.show({ kind: 'error', message: msg });
    }
  }
  function updatePriority(idx: number, patch: Partial<{ prioridade: number; groupId: string }>) {
    setPriorities((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }
  function removePriority(idx: number) {
    setPriorities((prev) => prev.filter((_, i) => i !== idx).map((p, i) => ({ ...p, prioridade: i + 1 })));
  }

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
          <Button disabled={isPending} className="bg-[#008bb1] hover:bg-[#007697] text-white h-10 px-6" onClick={handleSave}>
            {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <section>
        <div className="mb-2 text-xs font-semibold tracking-wide text-[#008bb1]">NOME DO MAPEAMENTO</div>
        <input
          ref={descricaoRef}
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
            <select
              value={form.categoriaProdutoId ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, categoriaProdutoId: e.target.value || undefined }))}
              className="h-10 rounded border px-3 text-sm bg-white shadow-sm"
            >
              <option value="">Selecione a categoria</option>
              {categoryOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#334b52]">Produto <span className="text-muted-foreground text-xs">(Opcional)</span></label>
            <select
              value={form.produtoId ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, produtoId: e.target.value || undefined }))}
              className="h-10 rounded border px-3 text-sm bg-white shadow-sm"
            >
              <option value="">Selecione o produto</option>
              {productOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
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
        <div className="flex flex-col gap-3">
          <div className="flex justify-end">
            <Button onClick={addPriority} className="border text-[#008bb1] border-[#008bb1] bg-transparent hover:bg-cyan-50">Adicionar prioridade</Button>
          </div>
          {priorities.length > 0 && (
            <div className="grid grid-cols-1 gap-3">
              {priorities.map((p, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-24">Prioridade {p.prioridade}</span>
                  <select
                    value={p.groupId}
                    onChange={(e) => updatePriority(idx, { groupId: e.target.value })}
                    className="h-10 rounded border px-3 text-sm bg-white shadow-sm min-w-[320px]"
                  >
                    {addressGroupOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                  <Button variant="outline" onClick={() => removePriority(idx)}>Remover</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
