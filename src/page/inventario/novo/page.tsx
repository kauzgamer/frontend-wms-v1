import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCreateInventory } from "@/lib/hooks/use-inventory";
import { createInventorySchema } from "@/lib/validation/inventory";
import { useToast } from "@/components/ui/toast-context";
import { useNavigate } from "react-router-dom";
import { useDeposits } from "@/lib/hooks/use-organization";
import { usePhysicalStructures } from "@/lib/hooks/use-physical-structures";
import {
  useStreetsByDeposit,
  useAddressesByStreet,
} from "@/lib/hooks/use-addresses";
import type { PhysicalStructureSummary } from "@/lib/types/physical-structures";

type AddressInScope = {
  id: string;
  depositoId: string;
  estruturaFisicaId: string;
  coordenadas: Array<{
    tipo: string;
    nome: string;
    abrev: string;
    inicio: string | number;
    fim: string | number;
  }>;
  situacao?: string;
  enderecoEspecifico?: {
    id: string;
    enderecoCompleto: string;
    enderecoAbreviado: string;
    funcao: string;
    acessivelAMao: boolean;
    situacao: string;
  };
};

export default function NovoInventarioPage() {
  const [step, setStep] = useState(1);
  const [tipo, setTipo] = useState<"ENDERECO" | "PRODUTO" | "GERAL">(
    "ENDERECO"
  );
  const [escopo, setEscopo] = useState<AddressInScope[]>([]);
  const createMutation = useCreateInventory();
  const toast = useToast();
  const navigate = useNavigate();
  const identificadorRef = useRef<HTMLInputElement>(null);
  const descricaoRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    const raw = {
      identificador: identificadorRef.current?.value?.trim() || undefined,
      descricao: descricaoRef.current?.value?.trim() || "",
      tipo,
      escopo: tipo === "ENDERECO" ? escopo : undefined,
    };
    const parsed = createInventorySchema.safeParse(raw);
    if (!parsed.success) {
      parsed.error.issues.forEach((i) =>
        toast.show({ kind: "error", message: i.message })
      );
      throw new Error("Validation failed");
    }
    await createMutation.mutateAsync(parsed.data);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold" style={{ color: "#4a5c60" }}>
          Novo inventário
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/inventario")}>
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              if (step < 5) {
                setStep((s) => Math.min(5, s + 1));
                return;
              }
              try {
                // Validação adicional: se tipo ENDERECO exigir escopo
                if (tipo === "ENDERECO" && escopo.length === 0) {
                  toast.show({
                    kind: "error",
                    message: "Adicione pelo menos 1 endereço ao escopo.",
                  });
                  return;
                }
                await handleSubmit();
                toast.show({
                  kind: "success",
                  message: "Inventário criado com sucesso",
                });
                navigate("/inventario");
              } catch (e: unknown) {
                const message =
                  e instanceof Error ? e.message : "Erro ao criar inventário";
                toast.show({ kind: "error", message });
              }
            }}
            disabled={
              createMutation.isPending ||
              (step === 5 && tipo === "ENDERECO" && escopo.length === 0)
            }
          >
            {step < 5
              ? "Próximo"
              : createMutation.isPending
              ? "Salvando..."
              : "Salvar"}
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
          <SecaoEscopo tipo={tipo} escopo={escopo} setEscopo={setEscopo} />
        )}
        {step === 3 && <SecaoCriterios />}
        {step === 4 && <SecaoIntegracao />}
        {step === 5 && (
          <SecaoResumo
            tipo={tipo}
            identificador={identificadorRef.current?.value?.trim() || ""}
            descricao={descricaoRef.current?.value?.trim() || ""}
            escopo={escopo}
          />
        )}
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  const steps = ["Início", "Escopo", "Critérios", "Integração", "Resumo"];
  return (
    <div className="flex items-center gap-6">
      {steps.map((label, idx) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`size-8 rounded-full flex items-center justify-center font-semibold ${
              step > idx
                ? "bg-cyan-500 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {idx + 1}
          </div>
          <div
            className={`${step >= idx + 1 ? "text-cyan-600" : "text-gray-400"}`}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

function SecaoInicio({
  identificadorRef,
  descricaoRef,
  tipo,
  setTipo,
}: {
  identificadorRef: React.RefObject<HTMLInputElement | null>;
  descricaoRef: React.RefObject<HTMLInputElement | null>;
  tipo: "ENDERECO" | "PRODUTO" | "GERAL";
  setTipo: (t: "ENDERECO" | "PRODUTO" | "GERAL") => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2 text-cyan-600">
          INFORMAÇÕES INICIAIS
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-sm">Tipo</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="tipo"
                  checked={tipo === "ENDERECO"}
                  onChange={() => setTipo("ENDERECO")}
                />{" "}
                Por endereço
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="tipo"
                  checked={tipo === "PRODUTO"}
                  onChange={() => setTipo("PRODUTO")}
                />{" "}
                Por produto
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="tipo"
                  checked={tipo === "GERAL"}
                  onChange={() => setTipo("GERAL")}
                />{" "}
                Geral
              </label>
            </div>
          </div>
          <div>
            <label className="text-sm mb-2 block">Identificador</label>
            <input
              ref={identificadorRef}
              className="w-full border rounded px-3 py-2 text-sm bg-white"
              placeholder="Gerado automaticamente"
              defaultValue={Math.floor(Math.random() * 1e8)
                .toString()
                .padStart(8, "0")}
            />
          </div>
          <div>
            <label className="text-sm mb-2 block">Descrição</label>
            <input
              ref={descricaoRef}
              className="w-full border rounded px-3 py-2 text-sm bg-white"
              placeholder="Descrição"
              defaultValue=""
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SecaoEscopo({
  tipo,
  escopo,
  setEscopo,
}: {
  tipo: "ENDERECO" | "PRODUTO" | "GERAL";
  escopo: AddressInScope[];
  setEscopo: (e: AddressInScope[]) => void;
}) {
  // Estado para seleção de escopo
  const [depositoSelecionado, setDepositoSelecionado] = useState<string>("");
  const [estruturaSelecionada, setEstruturaSelecionada] = useState<string>("");
  const [ruaSelecionada, setRuaSelecionada] = useState<string>("");
  const [enderecosDisponiveis, setEnderecosDisponiveis] = useState<
    Array<{
      id: string;
      enderecoCompleto: string;
      enderecoAbreviado: string;
      funcao: string;
      acessivelAMao: boolean;
      situacao: string;
    }>
  >([]);
  const [enderecosSelecionados, setEnderecosSelecionados] = useState<string[]>(
    []
  );

  const { data: depositos } = useDeposits();
  const { data: estruturas } = usePhysicalStructures();
  const { data: ruas } = useStreetsByDeposit(depositoSelecionado || undefined);
  const { data: enderecosPorRua } = useAddressesByStreet(
    depositoSelecionado || undefined,
    ruaSelecionada || undefined
  );

  // Atualizar endereços disponíveis quando a rua muda
  React.useEffect(() => {
    if (enderecosPorRua) {
      setEnderecosDisponiveis(enderecosPorRua);
      setEnderecosSelecionados([]); // Limpar seleção quando rua muda
    }
  }, [enderecosPorRua]);

  const handleDepositoChange = (dep: string) => {
    setDepositoSelecionado(dep);
    setEstruturaSelecionada("");
    setRuaSelecionada("");
    setEnderecosDisponiveis([]);
    setEnderecosSelecionados([]);
  };

  const handleEstruturaChange = (est: string) => {
    setEstruturaSelecionada(est);
    setRuaSelecionada("");
    setEnderecosDisponiveis([]);
    setEnderecosSelecionados([]);
  };

  const handleRuaChange = (rua: string) => {
    setRuaSelecionada(rua);
    setEnderecosSelecionados([]);
  };

  const adicionarSelecionados = () => {
    if (enderecosSelecionados.length === 0) return;

    // Para o escopo, precisamos transformar os endereços selecionados em AddressInScope
    const alreadyAddedIds = new Set(
      escopo.map((e) => e.enderecoEspecifico?.id).filter(Boolean) as string[]
    );

    const selecionados = enderecosSelecionados
      .filter((enderecoId) => !alreadyAddedIds.has(enderecoId))
      .map((enderecoId) => {
        const endereco = enderecosDisponiveis.find((e) => e.id === enderecoId);
        return {
          id: `scope-${enderecoId}`,
          depositoId: depositoSelecionado,
          estruturaFisicaId: estruturaSelecionada,
          coordenadas: [
            {
              tipo: "R",
              nome: "Rua",
              abrev: "R",
              inicio: ruaSelecionada,
              fim: ruaSelecionada,
            },
            // Para endereços específicos, usamos coordenadas vazias ou baseadas no endereço
            { tipo: "C", nome: "Prédio", abrev: "C", inicio: "", fim: "" },
            { tipo: "N", nome: "Nível", abrev: "N", inicio: "", fim: "" },
          ],
          situacao: "ATIVO" as const,
          enderecoEspecifico: endereco, // Adicionar referência ao endereço específico
        };
      });

    if (selecionados.length === 0) {
      // nada novo para adicionar
      setEnderecosSelecionados([]);
      return;
    }

    setEscopo([...escopo, ...selecionados]);
    setEnderecosSelecionados([]);
  };

  const removerDoEscopo = (id: string) => {
    setEscopo(escopo.filter((addr) => addr.id !== id));
  };

  if (tipo !== "ENDERECO") {
    return (
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-cyan-600">
          SELEÇÃO DO ESCOPO
        </h3>
        <div className="text-sm text-muted-foreground">
          Nenhum escopo necessário para o tipo selecionado.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-cyan-600">SELEÇÃO DO ESCOPO</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm mb-2 block">Depósito</label>
          <select
            value={depositoSelecionado}
            onChange={(e) => handleDepositoChange(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm bg-white"
          >
            <option value="">Selecione o depósito</option>
            {depositos?.map((dep) => (
              <option key={dep.id} value={dep.id}>
                {dep.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm mb-2 block">Estrutura Física</label>
          <select
            value={estruturaSelecionada}
            onChange={(e) => handleEstruturaChange(e.target.value)}
            disabled={!depositoSelecionado}
            className="w-full border rounded px-3 py-2 text-sm bg-white"
          >
            <option value="">Selecione a estrutura</option>
            {estruturas?.map((est: PhysicalStructureSummary) => (
              <option key={est.id} value={est.id}>
                {est.titulo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {estruturaSelecionada && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm mb-2 block">Rua Ativa</label>
              <select
                value={ruaSelecionada}
                onChange={(e) => handleRuaChange(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm bg-white"
                disabled={!ruas || ruas.length === 0}
              >
                <option value="">Selecione uma rua</option>
                {ruas?.map((rua) => (
                  <option key={rua} value={rua}>
                    Rua {rua}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-muted-foreground">
                {ruas?.length
                  ? `${ruas.length} ruas ativas encontradas`
                  : "Selecione depósito e estrutura primeiro"}
              </div>
            </div>
          </div>

          {ruaSelecionada && enderecosDisponiveis.length > 0 && (
            <div className="border rounded p-4">
              <h4 className="text-sm font-semibold mb-2">
                Endereços da Rua {ruaSelecionada} ({enderecosDisponiveis.length}{" "}
                endereços)
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => {
                      if (
                        enderecosSelecionados.length ===
                        enderecosDisponiveis.length
                      ) {
                        setEnderecosSelecionados([]);
                      } else {
                        setEnderecosSelecionados(
                          enderecosDisponiveis.map((e) => e.id)
                        );
                      }
                    }}
                    className="text-xs text-cyan-600 hover:text-cyan-800 underline"
                  >
                    {enderecosSelecionados.length ===
                    enderecosDisponiveis.length
                      ? "Desmarcar todos"
                      : "Selecionar todos"}
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {enderecosSelecionados.length} de{" "}
                    {enderecosDisponiveis.length} selecionados
                  </span>
                </div>
                {enderecosDisponiveis.map((endereco) => {
                  const jaAdicionado = escopo.some(
                    (e) => e.enderecoEspecifico?.id === endereco.id
                  );
                  return (
                    <label
                      key={endereco.id}
                      className={`flex items-center gap-2 text-sm hover:bg-gray-50 p-1 rounded ${
                        jaAdicionado ? "opacity-60" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={
                          jaAdicionado
                            ? true
                            : enderecosSelecionados.includes(endereco.id)
                        }
                        disabled={jaAdicionado}
                        onChange={(e) => {
                          if (jaAdicionado) return;
                          if (e.target.checked) {
                            setEnderecosSelecionados([
                              ...enderecosSelecionados,
                              endereco.id,
                            ]);
                          } else {
                            setEnderecosSelecionados(
                              enderecosSelecionados.filter(
                                (id) => id !== endereco.id
                              )
                            );
                          }
                        }}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium">
                          {endereco.enderecoAbreviado}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {endereco.enderecoCompleto}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        {endereco.acessivelAMao ? "Acessível" : "Não acessível"}
                        {jaAdicionado && (
                          <span className="px-2 py-0.5 border rounded text-[10px]">
                            Já no escopo
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
              <Button
                onClick={adicionarSelecionados}
                className="mt-4"
                disabled={enderecosSelecionados.length === 0}
              >
                Adicionar {enderecosSelecionados.length} Endereço
                {enderecosSelecionados.length !== 1 ? "s" : ""} Selecionado
                {enderecosSelecionados.length !== 1 ? "s" : ""}
              </Button>
            </div>
          )}

          {ruaSelecionada && enderecosDisponiveis.length === 0 && (
            <div className="border rounded p-4 bg-yellow-50">
              <div className="text-sm text-yellow-800">
                Nenhum endereço encontrado para a Rua {ruaSelecionada}
              </div>
            </div>
          )}
        </>
      )}

      {escopo.length > 0 && (
        <div className="border rounded p-4">
          <h4 className="text-sm font-semibold mb-2">
            Escopo Atual ({escopo.length} endereços)
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {escopo.map((addr: AddressInScope) => (
              <div
                key={addr.id}
                className="flex justify-between items-center text-sm p-2 border rounded"
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {addr.enderecoEspecifico?.enderecoAbreviado ||
                      `Rua ${addr.coordenadas[0]?.inicio}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {addr.enderecoEspecifico?.enderecoCompleto ||
                      "Endereço específico"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {addr.enderecoEspecifico?.acessivelAMao
                      ? "Acessível a mão"
                      : "Não acessível a mão"}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removerDoEscopo(addr.id)}
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => setEscopo([])}
            className="mt-2"
          >
            Limpar Escopo
          </Button>
        </div>
      )}
    </div>
  );
}

function SecaoCriterios() {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-cyan-600">
        CRITÉRIOS DO INVENTÁRIO
      </h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="text-sm">
            Considerar estoque como primeira contagem
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="primeira" /> Sim
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="primeira" defaultChecked /> Não
          </label>
        </div>
        <div className="space-y-2">
          <div className="text-sm">
            Permite ao planejador escolher a contagem válida
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="validacao" /> Sim
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="validacao" defaultChecked /> Não
          </label>
        </div>
        <div className="space-y-2">
          <div className="text-sm">Atribuir operador</div>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="operador" defaultChecked /> Livre
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="operador" /> Não sequencial
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="operador" /> Restrito
          </label>
        </div>
      </div>
    </div>
  );
}

function SecaoIntegracao() {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-cyan-600">INTEGRAÇÃO</h3>
      <div className="text-sm text-muted-foreground">
        Integração com ERP a definir.
      </div>
    </div>
  );
}

function SecaoResumo({
  tipo,
  identificador,
  descricao,
  escopo,
}: {
  tipo: "ENDERECO" | "PRODUTO" | "GERAL";
  identificador: string;
  descricao: string;
  escopo: AddressInScope[];
}) {
  const totalEnderecos = escopo.length;
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-cyan-600">RESUMO</h3>
      <div className="grid grid-cols-2 gap-6 text-sm">
        <div className="space-y-2">
          <div>
            <span className="font-medium">Identificador:</span>{" "}
            {identificador || "Automático"}
          </div>
          <div>
            <span className="font-medium">Descrição:</span> {descricao || "-"}
          </div>
          <div>
            <span className="font-medium">Tipo:</span> {tipo}
          </div>
        </div>
        {tipo === "ENDERECO" && (
          <div className="space-y-2">
            <div>
              <span className="font-medium">Endereços no escopo:</span>{" "}
              {totalEnderecos}
            </div>
            <div className="max-h-48 overflow-y-auto border rounded">
              {escopo.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between px-3 py-2 border-b last:border-b-0"
                >
                  <div>
                    <div className="font-medium">
                      {e.enderecoEspecifico?.enderecoAbreviado ||
                        `Rua ${e.coordenadas[0]?.inicio}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {e.enderecoEspecifico?.enderecoCompleto}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {e.enderecoEspecifico?.acessivelAMao
                      ? "Acessível"
                      : "Não acessível"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {tipo === "ENDERECO" && totalEnderecos === 0 && (
        <div className="text-sm text-red-600">
          Adicione pelo menos 1 endereço ao escopo para salvar.
        </div>
      )}
    </div>
  );
}
