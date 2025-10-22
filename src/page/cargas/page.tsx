import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLoads } from "@/lib/hooks/use-loads";

export default function CargasPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useLoads({ limit: 50, search });
  const rows = useMemo(() => data?.data ?? [], [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cargas</h1>
        <div className="flex items-center gap-2">
          <Link to="/expedicao/novo-processo" className="inline-flex items-center px-3 h-9 rounded-md border bg-white">+ Nova carga</Link>
        </div>
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <div className="p-3 flex items-center gap-2">
          <input
            placeholder="Pesquisar por código"
            className="h-8 w-60 border rounded px-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-3 py-2">Código</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Transportadora</th>
                <th className="text-left px-3 py-2">Documentos</th>
                <th className="text-left px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-3 py-4">Carregando...</td></tr>
              ) : (
                rows.map((l) => (
                  <tr key={l.id} className="border-b">
                    <td className="px-3 py-2 font-medium">{l.codigo}</td>
                    <td className="px-3 py-2">{l.status}</td>
                    <td className="px-3 py-2">{l.carrier?.nome ?? "-"}</td>
                    <td className="px-3 py-2">{l.shipments?.length ?? 0}</td>
                    <td className="px-3 py-2">
                      <Link to={`/cargas/${l.id}`} className="text-sky-700 hover:underline">Detalhes</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
