import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAddressGroups } from "@/lib/hooks/use-address-groups";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AddressGroupsPage() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useAddressGroups({ q, page: 1, limit: 50 });

  const items = useMemo(() => data ?? [], [data]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Grupos de Endereços</h1>
        <Button asChild>
          <Link to="/settings/grupo-endereco/new">Novo grupo</Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome..."
          className="max-w-md"
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Depósito</TableHead>
              <TableHead>Estrutura Física</TableHead>
              <TableHead className="text-right">Qtde Endereços</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>Carregando...</TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>Nenhum grupo encontrado.</TableCell>
              </TableRow>
            ) : (
              items.map((g) => (
                <TableRow key={g.id}>
                  <TableCell>
                    <Link
                      to={`/settings/grupo-endereco/${g.id}`}
                      className="text-primary hover:underline"
                    >
                      {g.name}
                    </Link>
                  </TableCell>
                  <TableCell>{g.deposit?.nome ?? "-"}</TableCell>
                  <TableCell>
                    {g.physicalStructure?.titulo ?? g.physicalStructureSlug}
                  </TableCell>
                  <TableCell className="text-right">
                    {g._count?.addresses ?? 0}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
