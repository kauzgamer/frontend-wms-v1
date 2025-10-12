import { useParams, Link } from "react-router-dom";
import {
  useInventory,
  useApplyInventoryAdjustments,
  usePreviewInventoryAdjustments,
} from "@/lib/hooks/use-inventory";
import { Button } from "@/components/ui/button";

export default function InventarioDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useInventory(id);
  const applyAdj = useApplyInventoryAdjustments();
  const previewAdj = usePreviewInventoryAdjustments();

  if (isLoading) return <div className="p-6">Carregando…</div>;
  if (error)
    return <div className="p-6 text-red-600">Erro ao carregar inventário.</div>;
  if (!data) return <div className="p-6">Inventário não encontrado.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold" style={{ color: "#4a5c60" }}>
          Inventário {data.identificador}
        </h1>
        <div className="flex gap-2 text-sm">
          <Button variant="outline" asChild>
            <Link to="/inventario">Voltar</Link>
          </Button>
          {id ? (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={async () => {
                  if (!id) return;
                  try {
                    const res = await previewAdj.mutateAsync(id);
                    const msg = `Pré-visualização:\n- Ajustes: ${
                      res.adjusted
                    }\n- Ignorados: ${res.skipped}\n- Problemas: ${
                      res.issues?.length || 0
                    }`;
                    const proceed = confirm(
                      `${msg}\n\nDeseja aplicar os ajustes agora?`
                    );
                    if (proceed) {
                      const applied = await applyAdj.mutateAsync(id);
                      alert(
                        `Ajuste aplicado: ${applied.adjusted} ajustados, ${applied.skipped} ignorados.`
                      );
                    }
                  } catch {
                    alert("Falha ao pré-visualizar ajustes");
                  }
                }}
                disabled={previewAdj.isPending || applyAdj.isPending}
              >
                {previewAdj.isPending
                  ? "Pré-visualizando..."
                  : "Pré-visualizar ajustes"}
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const res = await applyAdj.mutateAsync(id!);
                    alert(
                      `Ajuste aplicado: ${res.adjusted} ajustados, ${res.skipped} ignorados.`
                    );
                  } catch {
                    alert("Falha ao aplicar ajustes");
                  }
                }}
                disabled={applyAdj.isPending}
              >
                {applyAdj.isPending
                  ? "Aplicando..."
                  : "Aplicar ajustes no estoque"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Info label="Descrição" value={data.descricao || "-"} />
        <Info label="Status" value={data.status} />
        <Info label="Progresso" value={`${data.progresso}%`} />
        <Info
          label="Criado em"
          value={new Date(data.criadoEm).toLocaleString()}
        />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded p-4 bg-white">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm mt-1">{value}</div>
    </div>
  );
}
