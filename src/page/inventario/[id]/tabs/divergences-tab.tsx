import { useState } from "react";
import { useInventoryDivergences, useReviewDivergence } from "@/lib/hooks/use-inventory-advanced";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, MapPin } from "lucide-react";
import type { InventoryDivergence } from "@/lib/types/inventory-advanced";

interface Props {
  inventoryId: string;
}

export function InventoryDivergencesTab({ inventoryId }: Props) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");
  const [severityFilter, setSeverityFilter] = useState<string>("TODOS");
  const [selectedDivergence, setSelectedDivergence] = useState<InventoryDivergence | null>(null);
  
  const { data, isLoading } = useInventoryDivergences(inventoryId, {
    page,
    limit: 20,
    status: statusFilter as any,
    severity: severityFilter as any,
  });
  
  const reviewMutation = useReviewDivergence();

  if (isLoading) {
    return <div className="p-6 text-center">Carregando divergências...</div>;
  }

  const divergences = data?.data ?? [];
  const summary = data?.summary;

  return (
    <div className="space-y-6">
      {/* SUMMARY */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pendentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{summary.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Em Análise</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{summary.inAnalysis}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Aprovadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{summary.approved}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FILTROS */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="EM_ANALISE">Em Análise</SelectItem>
                  <SelectItem value="APROVADA">Aprovada</SelectItem>
                  <SelectItem value="REJEITADA">Rejeitada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Severidade</Label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todas</SelectItem>
                  <SelectItem value="CRITICA">Crítica</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                  <SelectItem value="MEDIA">Média</SelectItem>
                  <SelectItem value="BAIXA">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TABELA */}
      <Card>
        <CardHeader>
          <CardTitle>Divergências Encontradas</CardTitle>
          <CardDescription>
            {divergences.length} divergência(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Esperado</TableHead>
                  <TableHead>Contado</TableHead>
                  <TableHead>Divergência</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {divergences.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhuma divergência encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  divergences.map((div) => (
                    <TableRow key={div.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {div.addressLabel}
                        </div>
                      </TableCell>
                      <TableCell>{div.productName}</TableCell>
                      <TableCell>{div.expectedQty}</TableCell>
                      <TableCell>{div.countedQty}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {div.divergenceQty > 0 ? (
                            <>
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="text-green-600 font-semibold">+{div.divergenceQty}</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-4 w-4 text-red-600" />
                              <span className="text-red-600 font-semibold">{div.divergenceQty}</span>
                            </>
                          )}
                          <span className="text-xs text-muted-foreground">
                            ({div.divergencePerc.toFixed(1)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={div.divergenceType === 'SOBRA' ? 'default' : 'warning'}>
                          {div.divergenceType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          div.severity === 'CRITICA' ? 'warning' :
                          div.severity === 'ALTA' ? 'warning' :
                          div.severity === 'MEDIA' ? 'default' :
                          'secondary'
                        }>
                          {div.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          div.status === 'APROVADA' ? 'default' :
                          div.status === 'REJEITADA' ? 'warning' :
                          'secondary'
                        }>
                          {div.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {div.status === 'PENDENTE' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedDivergence(div)}
                          >
                            Analisar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* PAGINAÇÃO */}
          {divergences.length > 0 && (
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
                  disabled={divergences.length < 20}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL DE ANÁLISE */}
      <ReviewDivergenceDialog
        divergence={selectedDivergence}
        open={!!selectedDivergence}
        onClose={() => setSelectedDivergence(null)}
        onSubmit={async (data) => {
          if (!selectedDivergence) return;
          try {
            await reviewMutation.mutateAsync({
              divergenceId: selectedDivergence.id,
              data,
            });
            setSelectedDivergence(null);
          } catch (error) {
            console.error('Erro ao revisar divergência:', error);
            alert('Erro ao revisar divergência. Tente novamente.');
          }
        }}
      />
    </div>
  );
}

interface ReviewDivergenceDialogProps {
  divergence: InventoryDivergence | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    cause: 'ERRO_CONTAGEM' | 'PRODUTO_AVARIADO' | 'FURTO' | 'ERRO_SISTEMA' | 'MOVIMENTACAO_NAO_LANCADA' | 'OUTRO';
    responsible?: string;
    action: string;
    status: 'EM_ANALISE' | 'APROVADA' | 'REJEITADA';
  }) => Promise<void>;
}

function ReviewDivergenceDialog({ divergence, open, onClose, onSubmit }: ReviewDivergenceDialogProps) {
  const [cause, setCause] = useState<string>('ERRO_CONTAGEM');
  const [responsible, setResponsible] = useState('');
  const [action, setAction] = useState('');
  const [status, setStatus] = useState<string>('EM_ANALISE');

  if (!divergence) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Análise de Divergência</DialogTitle>
          <DialogDescription>
            Analise e classifique a divergência encontrada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* DETALHES */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-md">
            <div>
              <div className="text-xs text-muted-foreground">Endereço</div>
              <div className="font-medium">{divergence.addressLabel}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Produto</div>
              <div className="font-medium">{divergence.productName}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Esperado</div>
              <div className="font-medium">{divergence.expectedQty}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Contado</div>
              <div className="font-medium">{divergence.countedQty}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Diferença</div>
              <div className={`font-medium ${divergence.divergenceQty > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {divergence.divergenceQty > 0 ? '+' : ''}{divergence.divergenceQty} ({divergence.divergencePerc.toFixed(1)}%)
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Severidade</div>
              <Badge variant={divergence.severity === 'CRITICA' ? 'warning' : 'default'}>
                {divergence.severity}
              </Badge>
            </div>
          </div>

          {/* FORMULÁRIO */}
          <div className="space-y-4">
            <div>
              <Label>Causa da Divergência *</Label>
              <Select value={cause} onValueChange={setCause}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ERRO_CONTAGEM">Erro na contagem</SelectItem>
                  <SelectItem value="PRODUTO_AVARIADO">Produto avariado</SelectItem>
                  <SelectItem value="FURTO">Furto/Perda</SelectItem>
                  <SelectItem value="ERRO_SISTEMA">Erro no sistema</SelectItem>
                  <SelectItem value="MOVIMENTACAO_NAO_LANCADA">Movimentação não lançada</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Responsável (opcional)</Label>
              <Input
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>

            <div>
              <Label>Ação Corretiva *</Label>
              <Textarea
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="Descreva a ação corretiva tomada..."
                rows={4}
              />
            </div>

            <div>
              <Label>Status *</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EM_ANALISE">Em Análise</SelectItem>
                  <SelectItem value="APROVADA">Aprovar</SelectItem>
                  <SelectItem value="REJEITADA">Rejeitar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (!action || action.length < 10) {
                alert('Descreva a ação corretiva com pelo menos 10 caracteres.');
                return;
              }
              onSubmit({
                cause: cause as any,
                responsible: responsible || undefined,
                action,
                status: status as any,
              });
            }}
          >
            Salvar Análise
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

