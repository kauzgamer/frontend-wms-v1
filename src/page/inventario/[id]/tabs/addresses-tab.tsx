import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInventoryAddresses } from "@/lib/hooks/use-inventory";
import { ChevronLeft, ChevronRight, Package, Calendar, User, CheckCircle2, XCircle } from "lucide-react";

interface Props {
  inventoryId: string;
}

export function InventoryAddressesTab({ inventoryId }: Props) {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useInventoryAddresses(inventoryId, { page, limit });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-sm text-muted-foreground">Carregando endereços...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-sm text-red-600">Erro ao carregar endereços.</div>
        </CardContent>
      </Card>
    );
  }

  const addresses = data?.data || [];
  const total = data?.meta?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const getStatusBadge = (nextStage?: string) => {
    if (!nextStage) return <Badge variant="outline">Não iniciado</Badge>;
    
    switch (nextStage) {
      case 'PRIMEIRA':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">1ª Contagem</Badge>;
      case 'SEGUNDA':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">2ª Contagem</Badge>;
      case 'RECONTAGEM':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">Recontagem</Badge>;
      case 'FINALIZADO':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Finalizado</Badge>;
      default:
        return <Badge variant="outline">{nextStage}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Endereços do Inventário</CardTitle>
        <CardDescription>
          Lista de todos os endereços incluídos neste inventário ({total} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Endereço</TableHead>
                <TableHead>Rua</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Picking</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Contagens</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addresses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhum endereço encontrado
                  </TableCell>
                </TableRow>
              ) : (
                addresses.map((address) => (
                  <TableRow key={address.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm">{address.shortLabel || address.fullLabel}</span>
                        {address.shortLabel && address.fullLabel && (
                          <span className="text-xs text-muted-foreground">{address.fullLabel}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{address.street || "-"}</TableCell>
                    <TableCell>
                      {address.function ? (
                        <Badge variant="secondary">{address.function}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {address.picking ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(address.nextStage)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{address.counts || 0}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <AddressDetailsDialog address={address} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Página {page} de {totalPages} ({total} endereços)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Dialog para mostrar detalhes das contagens de um endereço
function AddressDetailsDialog({ address }: { address: any }) {
  const [open, setOpen] = useState(false);

  if (!address.countsBreakdown || address.countsBreakdown.length === 0) {
    return (
      <Button variant="ghost" size="sm" disabled>
        Ver Detalhes
      </Button>
    );
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Ver Detalhes
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Detalhes do Endereço</h3>
              <p className="text-sm text-muted-foreground font-mono">
                {address.shortLabel || address.fullLabel}
              </p>
            </div>

            <div className="space-y-4">
              {address.countsBreakdown.map((count: any) => (
                <div key={count.index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">Contagem #{count.index}</Badge>
                    <Badge variant={count.origin === 'ESTOQUE' ? 'secondary' : 'default'}>
                      {count.origin}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {count.countedAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(count.countedAt).toLocaleString('pt-BR')}</span>
                      </div>
                    )}
                    
                    {count.countedByName && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{count.countedByName}</span>
                      </div>
                    )}

                    {count.productCode && (
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">{count.productCode}</span>
                      </div>
                    )}

                    {count.quantity !== null && count.quantity !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Quantidade:</span>{" "}
                        <span className="font-semibold">{count.quantity}</span>
                      </div>
                    )}
                  </div>

                  {count.isEmpty && (
                    <div className="mt-2">
                      <Badge variant="outline" className="bg-gray-100">
                        Endereço Vazio
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
