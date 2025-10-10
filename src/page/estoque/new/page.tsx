import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useToast } from '@/components/ui/toast-context';
import { useCreateStock } from '@/lib/hooks/use-stock';
import { createStockSchema } from '@/lib/validation/stock';

export default function NewEstoquePage() {
  const navigate = useNavigate();
  const { show } = useToast();
  const { mutateAsync, isPending } = useCreateStock();

  const [form, setForm] = useState<{
    productId: string;
    skuId: string;
    addressId: string;
    lote: string;
    quantity: number;
    quantityReserved: number;
    unitOfMeasure: string;
    validade: string;
    fabricacao: string;
    documentoOrigem: string;
    status: 'DISPONIVEL' | 'RESERVADO' | 'BLOQUEADO' | 'AVARIADO';
    observacao: string;
  }>({
    productId: '',
    skuId: '',
    addressId: '',
    lote: '',
    quantity: 0,
    quantityReserved: 0,
    unitOfMeasure: '',
    validade: '',
    fabricacao: '',
    documentoOrigem: '',
    status: 'DISPONIVEL',
    observacao: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      // Preparar dados para validação
      const dataToValidate = {
        ...form,
        productId: form.productId || undefined,
        skuId: form.skuId || null,
        addressId: form.addressId || undefined,
        lote: form.lote || null,
        unitOfMeasure: form.unitOfMeasure || null,
        validade: form.validade ? new Date(form.validade).toISOString() : null,
        fabricacao: form.fabricacao ? new Date(form.fabricacao).toISOString() : null,
        documentoOrigem: form.documentoOrigem || null,
        observacao: form.observacao || null,
      };

      // Validar com Zod
      const parsed = createStockSchema.safeParse(dataToValidate);

      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          show({ message: issue.message, kind: 'error' });
        });
        return;
      }

      // Enviar dados validados
      await mutateAsync(parsed.data);
      show({ message: 'Estoque criado com sucesso!', kind: 'success' });
      navigate('/estoque');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar estoque';
      show({ message: msg, kind: 'error' });
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 pt-4">
      <div>
        <Breadcrumb>
          <BreadcrumbList className="bg-background rounded-md border px-3 py-2 shadow-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Início</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/estoque">Estoque</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Novo</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card className="p-6 shadow-xs">
        <h1 className="text-2xl font-semibold mb-6">Nova Entrada de Estoque</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="productId" className="text-sm font-medium">
                Produto ID <span className="text-red-500">*</span>
              </label>
              <input
                id="productId"
                className="w-full h-9 rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                placeholder="UUID do produto"
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="skuId" className="text-sm font-medium">
                SKU ID
              </label>
              <input
                id="skuId"
                className="w-full h-9 rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                placeholder="UUID do SKU (opcional)"
                value={form.skuId}
                onChange={(e) => setForm({ ...form, skuId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="addressId" className="text-sm font-medium">
                Endereço ID <span className="text-red-500">*</span>
              </label>
              <input
                id="addressId"
                className="w-full h-9 rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                placeholder="UUID do endereço"
                value={form.addressId}
                onChange={(e) => setForm({ ...form, addressId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lote" className="text-sm font-medium">
                Lote
              </label>
              <input
                id="lote"
                className="w-full h-9 rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                placeholder="Número do lote"
                value={form.lote}
                onChange={(e) => setForm({ ...form, lote: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantidade <span className="text-red-500">*</span>
              </label>
              <input
                id="quantity"
                type="number"
                step="0.01"
                className="w-full h-9 rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                placeholder="0"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="quantityReserved" className="text-sm font-medium">
                Quantidade Reservada
              </label>
              <input
                id="quantityReserved"
                type="number"
                step="0.01"
                className="w-full h-9 rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                placeholder="0"
                value={form.quantityReserved}
                onChange={(e) =>
                  setForm({
                    ...form,
                    quantityReserved: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="unitOfMeasure" className="text-sm font-medium">
                Unidade de Medida
              </label>
              <input
                id="unitOfMeasure"
                className="w-full h-9 rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                placeholder="UN, KG, CX, etc"
                value={form.unitOfMeasure}
                onChange={(e) => setForm({ ...form, unitOfMeasure: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                className="w-full h-9 rounded-md border px-3 text-sm bg-background"
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as
                      | 'DISPONIVEL'
                      | 'RESERVADO'
                      | 'BLOQUEADO'
                      | 'AVARIADO',
                  })
                }
              >
                <option value="DISPONIVEL">Disponível</option>
                <option value="RESERVADO">Reservado</option>
                <option value="BLOQUEADO">Bloqueado</option>
                <option value="AVARIADO">Avariado</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="validade" className="text-sm font-medium">
                Data de Validade
              </label>
              <input
                id="validade"
                type="date"
                className="w-full h-9 rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                value={form.validade}
                onChange={(e) => setForm({ ...form, validade: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="fabricacao" className="text-sm font-medium">
                Data de Fabricação
              </label>
              <input
                id="fabricacao"
                type="date"
                className="w-full h-9 rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                value={form.fabricacao}
                onChange={(e) => setForm({ ...form, fabricacao: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="documentoOrigem" className="text-sm font-medium">
                Documento de Origem
              </label>
              <input
                id="documentoOrigem"
                className="w-full h-9 rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                placeholder="NFe, Pedido, etc"
                value={form.documentoOrigem}
                onChange={(e) =>
                  setForm({ ...form, documentoOrigem: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="observacao" className="text-sm font-medium">
              Observação
            </label>
            <textarea
              id="observacao"
              rows={3}
              className="w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
              placeholder="Observações adicionais"
              value={form.observacao}
              onChange={(e) => setForm({ ...form, observacao: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/estoque')}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
