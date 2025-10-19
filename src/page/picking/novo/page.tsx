import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-context";
import {
  useAvailablePickingAddresses,
  useAvailablePickingProducts,
  useCreatePicking,
} from "@/lib/hooks/use-picking";
import {
  createPickingSchema,
  type CreatePickingInput,
} from "@/lib/validation/picking";

type Step = 1 | 2 | 3;

export default function NovoMapeamentoPickingPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState<Step>(1);

  // Etapa 1 - Produto
  const [productSearch, setProductSearch] = useState("");
  const { data: productsRes, isLoading: loadingProducts } =
    useAvailablePickingProducts({ search: productSearch, limit: 20 });
  const [selectedProduct, setSelectedProduct] = useState<
    { id: string; name: string | null; sku: string | null } | undefined
  >();

  // Etapa 2 - Depósito e Endereço
  const [depositId, setDepositId] = useState("");
  const [street, setStreet] = useState("");
  const { data: addresses, isLoading: loadingAddresses } =
    useAvailablePickingAddresses(
      useMemo(() => ({ depositId, street }), [depositId, street])
    );
  const [selectedAddressId, setSelectedAddressId] = useState<
    string | undefined
  >();

  // Etapa 3 - Parâmetros
  const [reorderPoint, setReorderPoint] = useState<string>("0");
  const [maxQuantity, setMaxQuantity] = useState<string>("");

  const { mutateAsync: createAsync, isPending: saving } = useCreatePicking();

  function next() {
    if (step === 1) {
      if (!selectedProduct) {
        toast.show({ kind: "error", message: "Selecione um produto" });
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!depositId) {
        toast.show({ kind: "error", message: "Informe o depósito (UUID)" });
        return;
      }
      if (!selectedAddressId) {
        toast.show({
          kind: "error",
          message: "Selecione um endereço de picking",
        });
        return;
      }
      setStep(3);
      return;
    }
  }

  function prev() {
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  async function handleSave() {
    try {
      if (!selectedProduct || !selectedAddressId || !depositId) return;
      const payload: CreatePickingInput = {
        productId: selectedProduct.id,
        addressId: selectedAddressId,
        depositId,
        reorderPoint: Number(reorderPoint || 0),
        maxQuantity: Number(maxQuantity),
      };

      const parsed = createPickingSchema.safeParse(payload);
      if (!parsed.success) {
        parsed.error.issues.forEach((i) =>
          toast.show({ kind: "error", message: i.message })
        );
        return;
      }

      await createAsync(parsed.data);
      toast.show({ kind: "success", message: "Mapeamento criado com sucesso" });
      navigate("/picking");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar";
      toast.show({ kind: "error", message: msg });
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Novo mapeamento</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 text-sm">
        <span
          className={step === 1 ? "font-semibold" : "text-muted-foreground"}
        >
          1. Produto
        </span>
        <span className="text-muted-foreground">›</span>
        <span
          className={step === 2 ? "font-semibold" : "text-muted-foreground"}
        >
          2. Depósito e Endereço
        </span>
        <span className="text-muted-foreground">›</span>
        <span
          className={step === 3 ? "font-semibold" : "text-muted-foreground"}
        >
          3. Parâmetros
        </span>
      </div>

      {/* Step 1: Produto */}
      {step === 1 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Pesquisar produto (nome ou SKU)"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
            <Button onClick={() => setProductSearch(productSearch)}>
              Buscar
            </Button>
          </div>
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b">
                  <th className="text-left px-4 py-2">Produto</th>
                  <th className="text-left px-4 py-2">SKU</th>
                  <th className="w-40 px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {loadingProducts && (
                  <tr>
                    <td className="px-4 py-3" colSpan={3}>
                      Carregando...
                    </td>
                  </tr>
                )}
                {productsRes?.data?.map((p) => {
                  const isSel = selectedProduct?.id === p.id;
                  return (
                    <tr key={p.id} className="border-b last:border-b-0">
                      <td className="px-4 py-2">{p.name ?? "—"}</td>
                      <td className="px-4 py-2">{p.sku ?? "—"}</td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          variant={isSel ? "default" : "outline"}
                          onClick={() =>
                            setSelectedProduct(
                              isSel
                                ? undefined
                                : { id: p.id, name: p.name, sku: p.sku }
                            )
                          }
                          className="h-8"
                        >
                          {isSel ? "Selecionado" : "Selecionar"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {!loadingProducts && (productsRes?.data?.length ?? 0) === 0 && (
                  <tr>
                    <td className="px-4 py-4" colSpan={3}>
                      Nenhum produto encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button onClick={next} disabled={!selectedProduct}>
              Continuar
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Depósito e Endereço */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="text-sm font-medium">Depósito (UUID)</label>
              <Input
                placeholder="Informe o ID do depósito"
                value={depositId}
                onChange={(e) => setDepositId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Em breve: seleção de depósitos pela API. Por enquanto, informe o
                UUID.
              </p>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">
                Filtrar por rua/trecho
              </label>
              <Input
                placeholder="Ex.: RUA A"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                disabled={!depositId}
              />
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b">
                  <th className="text-left px-4 py-2">Endereço</th>
                  <th className="text-left px-4 py-2">Abreviado</th>
                  <th className="w-40 px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {loadingAddresses && (
                  <tr>
                    <td className="px-4 py-3" colSpan={3}>
                      Carregando...
                    </td>
                  </tr>
                )}
                {addresses?.map((a) => {
                  const isSel = selectedAddressId === a.id;
                  return (
                    <tr key={a.id} className="border-b last:border-b-0">
                      <td className="px-4 py-2">{a.enderecoCompleto}</td>
                      <td className="px-4 py-2">{a.enderecoAbreviado}</td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          variant={isSel ? "default" : "outline"}
                          onClick={() =>
                            setSelectedAddressId(isSel ? undefined : a.id)
                          }
                          className="h-8"
                          disabled={!depositId}
                        >
                          {isSel ? "Selecionado" : "Selecionar"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {!loadingAddresses &&
                  depositId &&
                  (addresses?.length ?? 0) === 0 && (
                    <tr>
                      <td className="px-4 py-4" colSpan={3}>
                        Nenhum endereço disponível
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              Produto:{" "}
              <span className="font-medium">
                {selectedProduct?.name ?? selectedProduct?.sku}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={prev}>
                Voltar
              </Button>
              <Button
                onClick={next}
                disabled={!depositId || !selectedAddressId}
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Parâmetros */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">
                Ponto de reabastecimento
              </label>
              <Input
                type="number"
                min={0}
                value={reorderPoint}
                onChange={(e) => setReorderPoint(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Quantidade máxima</label>
              <Input
                type="number"
                min={1}
                value={maxQuantity}
                onChange={(e) => setMaxQuantity(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Produto:{" "}
              <span className="font-medium">
                {selectedProduct?.name ?? selectedProduct?.sku}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={prev}>
                Voltar
              </Button>
              <Button onClick={handleSave} disabled={saving || !maxQuantity}>
                {saving ? "Salvando..." : "Salvar mapeamento"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
