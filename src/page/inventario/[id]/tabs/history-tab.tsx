import { useState } from "react";
import { useInventoryAuditLogs } from "@/lib/hooks/use-inventory-advanced";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, FileEdit } from "lucide-react";

interface Props {
  inventoryId: string;
}

export function InventoryHistoryTab({ inventoryId }: Props) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useInventoryAuditLogs(inventoryId, {
    page,
    limit: 20,
  });

  if (isLoading) {
    return <div className="p-6 text-center">Carregando histórico...</div>;
  }

  const logs = data?.data ?? [];

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('CREATED')) return 'default';
    if (action.includes('APPROVED') || action.includes('FINALIZED')) return 'default';
    if (action.includes('REJECTED') || action.includes('CANCELLED')) return 'destructive';
    if (action.includes('ANALYZED') || action.includes('REVIEWED')) return 'secondary';
    return 'outline';
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'CREATED': 'Criado',
      'STARTED': 'Iniciado',
      'PAUSED': 'Pausado',
      'RESUMED': 'Retomado',
      'FINALIZED': 'Finalizado',
      'CANCELLED': 'Cancelado',
      'COUNT_ADDED': 'Contagem Adicionada',
      'ADJUSTMENT_APPLIED': 'Ajuste Aplicado',
      'DIVERGENCES_ANALYZED': 'Divergências Analisadas',
      'DIVERGENCE_REVIEWED': 'Divergência Revisada',
      'APPROVAL_APPROVED': 'Aprovação Concedida',
      'APPROVAL_REJECTED': 'Aprovação Rejeitada',
    };
    return labels[action] || action.replace(/_/g, ' ');
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'INVENTORY':
        return <FileEdit className="h-4 w-4" />;
      case 'COUNT':
        return <Clock className="h-4 w-4" />;
      case 'DIVERGENCE':
        return <FileEdit className="h-4 w-4" />;
      default:
        return <FileEdit className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Ações</CardTitle>
          <CardDescription>
            Registro completo de todas as ações realizadas neste inventário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum registro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEntityIcon(log.entity)}
                          <span className="text-sm">{log.entity}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.userId ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{log.userId}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Sistema</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.changes && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-cyan-600 hover:underline">
                              Ver detalhes
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-[10px] overflow-auto max-w-md">
                              {JSON.stringify(log.changes, null, 2)}
                            </pre>
                          </details>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* PAGINAÇÃO */}
          {logs.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Página {page} de {Math.ceil((data?.meta.total ?? 0) / 20)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={logs.length < 20}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

