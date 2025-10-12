import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listAdjustmentLogs } from "@/lib/api/inventory";
import { Button } from "@/components/ui/button";

export default function InventarioAjustesPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ["inventory", id, "adjustment-logs"],
    queryFn: () => listAdjustmentLogs(id!),
    enabled: !!id,
    staleTime: 5000,
  });

  if (isLoading) return <div className="p-6">Carregando…</div>;
  if (error)
    return <div className="p-6 text-red-600">Erro ao carregar logs.</div>;

  const logs = data?.data ?? [];
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Histórico de ajustes</h1>
        <Button variant="outline" asChild>
          <Link to={`/inventario/${id}`}>Voltar</Link>
        </Button>
      </div>
      <div className="border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <Th>Data</Th>
              <Th>Ação</Th>
              <Th>Endereço</Th>
              <Th>Preview</Th>
              <Th>Aplicado</Th>
              <Th>Problemas</Th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t">
                <Td>{new Date(l.createdAt).toLocaleString()}</Td>
                <Td>{l.action}</Td>
                <Td>{l.addressId ?? "-"}</Td>
                <Td>{l.preview ? "Sim" : "Não"}</Td>
                <Td>{l.applied ? "Sim" : "Não"}</Td>
                <Td>{l.issues?.length ?? 0}</Td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="p-6 text-sm text-muted-foreground">
            Sem registros ainda.
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left p-2 font-medium">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="p-2">{children}</td>;
}
