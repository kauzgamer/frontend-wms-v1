import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-context";
import { useCreatePicking } from "@/lib/hooks/use-picking";
import {
  createPickingSchema,
  type CreatePickingInput,
} from "@/lib/validation/picking";
import { Search as SearchIcon, Trash } from "lucide-react";
import { getAddressesByStreet } from "@/lib/api/addresses";

export default function DefinirEnderecosPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // product id
  const [sp] = useSearchParams();
  const { show } = useToast();

  // infos do produto vindas via query (opcional)
  const productName = sp.get("name") ?? "Produto";
  const productSku = sp.get("sku") ?? "";

  // filtros da lista de endereços (carrega apenas endereços acessíveis à mão)
  const initialDeposit = sp.get("depositId") ?? "";
  const [depositId, setDepositId] = useState(initialDeposit);
  const [street, setStreet] = useState("");
  const [addresses, setAddresses] = useState<
    Array<{ id: string; enderecoCompleto: string; enderecoAbreviado: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function run() {
      if (!depositId || !street.trim()) {
        setAddresses([]);
        return;
      }
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await getAddressesByStreet(depositId, street, {
          funcao: "Picking",
          acessivelAMao: true,
        });
        // Garantia adicional de filtros aplicados
        const onlyPicking = (data || []).filter(
          (a) =>
            a.acessivelAMao === true &&
            String(a.funcao).toLowerCase() === "picking"
        );
        const mapped = onlyPicking.map((a) => ({
          id: a.id,
          enderecoCompleto: a.enderecoCompleto,
          enderecoAbreviado: a.enderecoAbreviado,
        }));
        if (!ignore) setAddresses(mapped);
      } catch (err) {
        if (!ignore)
          setLoadError(
            err instanceof Error ? err.message : "Erro ao carregar endereços"
          );
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, [depositId, street]);

  // seleção no painel direito (apenas 1 endereço, como no mock)
  const [selectedAddress, setSelectedAddress] = useState<{
    id: string;
    enderecoCompleto: string;
    enderecoAbreviado: string;
  } | null>(null);

  // formulário do painel direito
  const [tipoEstoque] = useState("EXP");
  const [maxQuantity, setMaxQuantity] = useState("");
  const [reorderPoint, setReorderPoint] = useState("");

  const { mutateAsync: createAsync, isPending } = useCreatePicking();

  async function handleSalvar() {
    if (!id || !selectedAddress || !depositId) {
      show({ kind: "error", message: "Selecione depósito e endereço" });
      return;
    }
    const payload: CreatePickingInput = {
      productId: id,
      addressId: selectedAddress.id,
      depositId,
      maxQuantity: Number(maxQuantity || 0),
      reorderPoint: Number(reorderPoint || 0),
    };
    const parsed = createPickingSchema.safeParse(payload);
    if (!parsed.success) {
      parsed.error.issues.forEach((i) =>
        show({ kind: "error", message: i.message })
      );
      return;
    }
    await createAsync(parsed.data);
    show({ kind: "success", message: "Endereço definido para o produto" });
    navigate("/picking");
  }

  return (
    <div className="flex flex-col gap-6 p-6 pt-4 max-w-[calc(100vw-80px)]">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-semibold leading-tight">
          Definir endereços para o produto {id} – {productName}{" "}
          {productSku ? `(${productSku})` : ""}
        </h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            disabled={!selectedAddress || !maxQuantity || isPending}
          >
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-4">
        {/* Coluna esquerda */}
        <div className="border rounded-md bg-white overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center gap-3">
            <div className="text-[15px] font-semibold">
              Endereços disponíveis
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Input
                placeholder="Depósito (UUID)"
                value={depositId}
                onChange={(e) => setDepositId(e.target.value)}
                className="w-[220px]"
              />
              <Input
                placeholder="Pesquisar"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-64"
                disabled={!depositId}
              />
              <Button size="icon" variant="outline" className="h-9 w-9">
                <SearchIcon className="size-4" />
              </Button>
            </div>
          </div>
          {/* Tabela de endereços */}
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Depósito</th>
                  <th className="text-left p-3">Endereço</th>
                  <th className="text-left p-3">Estrutura física</th>
                  <th className="w-32" />
                </tr>
              </thead>
              <tbody>
                {!depositId && (
                  <tr>
                    <td className="p-4 text-muted-foreground" colSpan={4}>
                      Informe o depósito (UUID) para listar endereços de
                      picking.
                    </td>
                  </tr>
                )}
                {depositId && !street.trim() && (
                  <tr>
                    <td className="p-4 text-muted-foreground" colSpan={4}>
                      Informe a rua (campo R) para listar endereços.
                    </td>
                  </tr>
                )}
                {depositId && isLoading && (
                  <tr>
                    <td className="p-4" colSpan={4}>
                      Carregando...
                    </td>
                  </tr>
                )}
                {depositId && loadError && (
                  <tr>
                    <td className="p-4 text-amber-700" colSpan={4}>
                      {loadError}
                    </td>
                  </tr>
                )}
                {addresses?.map((a) => (
                  <tr key={a.id} className="border-t hover:bg-muted/30">
                    <td className="p-3 align-top">
                      <div className="text-sm">Principal</div>
                      <div className="text-xs text-cyan-700">
                        Sem mapeamentos
                      </div>
                    </td>
                    <td className="p-3 align-top">
                      <div className="font-medium">{a.enderecoCompleto}</div>
                    </td>
                    <td className="p-3 align-top">
                      <div className="h-2.5 rounded bg-orange-400 w-56" />
                      <div className="text-[10px] text-orange-900 mt-1 font-semibold inline-block bg-orange-100 px-2 py-0.5 rounded">
                        PORTA PALETE
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        className="text-[#0c9abe] hover:underline text-sm font-medium"
                        onClick={() =>
                          setSelectedAddress({
                            id: a.id,
                            enderecoCompleto: a.enderecoCompleto,
                            enderecoAbreviado: a.enderecoAbreviado,
                          })
                        }
                      >
                        Selecionar
                      </button>
                    </td>
                  </tr>
                ))}
                {depositId &&
                  !isLoading &&
                  !loadError &&
                  (addresses?.length ?? 0) === 0 && (
                    <tr>
                      <td className="p-4" colSpan={4}>
                        Nenhum endereço encontrado
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
          <div className="border-t p-3 bg-white">
            <Button variant="outline" className="mx-auto block">
              Carregar mais resultados
            </Button>
          </div>
        </div>

        {/* Coluna direita */}
        <div className="border rounded-md bg-white overflow-hidden min-h-[240px]">
          <div className="px-4 py-3 border-b text-[15px] font-semibold">
            Endereços selecionados
          </div>
          {!selectedAddress ? (
            <div className="flex items-center justify-center text-center text-sm text-gray-500 h-56">
              <div>
                <div>Escolha um endereço e clique em</div>
                <div>selecionar para atribuí-lo a este produto.</div>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Principal</div>
                  <div className="font-medium">
                    {selectedAddress.enderecoCompleto}
                  </div>
                  <div className="text-xs text-cyan-700">
                    Utilizado em 1 mapeamento
                  </div>
                </div>
                <button
                  className="text-rose-600 hover:text-rose-700"
                  onClick={() => setSelectedAddress(null)}
                  title="Remover"
                  aria-label="Remover"
                >
                  <Trash className="size-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium">Tipo de estoque</label>
                  <Input value={tipoEstoque} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Qtd. máxima produto
                  </label>
                  <Input
                    placeholder="Informe a qtd. em unidades"
                    type="number"
                    value={maxQuantity}
                    onChange={(e) => setMaxQuantity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Ponto de reabastecimento
                  </label>
                  <Input
                    placeholder="Informe a qtd. em unidades"
                    type="number"
                    value={reorderPoint}
                    onChange={(e) => setReorderPoint(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
