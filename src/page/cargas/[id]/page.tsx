import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDeposits } from "@/lib/hooks/use-organization";
import { useGeneratePicking, useLoad } from "@/lib/hooks/use-loads";

export default function CargaDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { data: load, isLoading } = useLoad(params.id);
  const { data: deposits } = useDeposits();
  const [depositId, setDepositId] = useState("");
  const { mutateAsync: generate, isPending } = useGeneratePicking();

  useEffect(() => {
    if (!depositId && deposits?.length) {
      const principal = deposits.find((d) => d.principal)?.id ?? deposits[0].id;
      setDepositId(principal);
    }
  }, [deposits, depositId]);

  const rows = useMemo(() => load?.shipments ?? [], [load]);

  async function handleGenerate() {
    if (!depositId) {
      alert("Selecione um depósito");
      return;
    }
    try {
      await generate({
        loadId: params.id!,
        body: { depositId, overrides: {} },
      });
      // Navegar para lista de picking ou mostrar confirmação
      alert("Picking gerado com sucesso");
      navigate("/picking");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao gerar picking";
      alert(msg);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Carga</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="px-3 h-9 rounded-md border bg-white">Voltar</button>
          <button onClick={handleGenerate} disabled={isPending || isLoading || !load} className="px-3 h-9 rounded-md bg-sky-700 text-white">Gerar Picking</button>
        </div>
      </div>

      <div className="rounded-md border bg-white p-3">
        {isLoading || !load ? (
          <div>Carregando...</div>
        ) : (
          <div className="space-y-2 text-sm">
            <div><span className="text-gray-500">Código:</span> <span className="font-medium">{load.codigo}</span></div>
            <div><span className="text-gray-500">Status:</span> <span className="font-medium">{load.status}</span></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Depósito:</span>
              <select className="border rounded px-2 h-8" value={depositId} onChange={(e) => setDepositId(e.target.value)}>
                {(deposits ?? []).map((d) => (
                  <option key={d.id} value={d.id}>{d.nome}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <div className="p-3 font-medium">Documentos da carga</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-3 py-2">Documento</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((ls) => (
                <tr key={ls.id} className="border-b">
                  <td className="px-3 py-2">{ls.shipment?.numeroNf ?? ls.shipmentId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
