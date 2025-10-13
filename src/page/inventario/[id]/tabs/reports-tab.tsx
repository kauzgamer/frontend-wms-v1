import { useInventoryReport } from "@/lib/hooks/use-inventory-advanced";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, TrendingUp, PieChart as PieChartIcon, Users } from "lucide-react";

interface Props {
  inventoryId: string;
}

export function InventoryReportsTab({ inventoryId }: Props) {
  const { data: report, isLoading } = useInventoryReport(inventoryId);

  if (isLoading) {
    return <div className="p-6 text-center">Carregando relatórios...</div>;
  }

  if (!report) {
    return <div className="p-6 text-center text-muted-foreground">Nenhum dado disponível</div>;
  }

  const { inventory, stats, accuracy } = report;

  return (
    <div className="space-y-6">
      {/* RESUMO DO INVENTÁRIO */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Inventário</CardTitle>
          <CardDescription>
            Informações gerais sobre o inventário {inventory.identificador}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="text-lg font-semibold">{inventory.status.replace(/_/g, ' ')}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Progresso</div>
              <div className="text-lg font-semibold">{inventory.progresso}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Criado em</div>
              <div className="text-lg font-semibold">
                {new Date(inventory.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MÉTRICAS DE PERFORMANCE */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Acuracidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Taxa de Acuracidade</span>
                <span className="text-2xl font-bold text-green-600">
                  {accuracy.accuracyRate.toFixed(1)}%
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Endereços Precisos</span>
                  <span className="font-medium">{accuracy.accurateAddresses}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Endereços com Divergência</span>
                  <span className="font-medium text-red-600">{accuracy.divergentAddresses}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total de Endereços</span>
                  <span className="font-medium">{accuracy.totalAddresses}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Operadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Operadores Ativos</span>
                <span className="text-2xl font-bold text-cyan-600">
                  {stats.uniqueOperators}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total de Contagens</span>
                  <span className="font-medium">{stats.totalCounts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tempo Médio</span>
                  <span className="font-medium">
                    {stats.avgCountTime ? `${stats.avgCountTime.toFixed(0)}min` : '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Endereços Contados</span>
                  <span className="font-medium">{stats.countedAddresses}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PROGRESSO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progresso da Contagem
          </CardTitle>
          <CardDescription>
            Status atual da execução do inventário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Endereços Contados</span>
                <span className="font-semibold">
                  {stats.countedAddresses} / {stats.totalAddresses}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-cyan-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${(stats.countedAddresses / stats.totalAddresses) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <div className="text-xs text-muted-foreground">Concluídos</div>
                <div className="text-2xl font-bold text-green-600">{stats.countedAddresses}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Pendentes</div>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingAddresses}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Com Divergência</div>
                <div className="text-2xl font-bold text-red-600">{stats.divergentAddresses}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PERFORMANCE POR PRODUTO (se disponível) */}
      {accuracy.byProduct && accuracy.byProduct.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Divergências por Produto
            </CardTitle>
            <CardDescription>
              Produtos com maior índice de divergência
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {accuracy.byProduct.slice(0, 10).map((product) => (
                <div key={product.productId} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm font-medium">{product.productName}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      Div: {product.totalDivergence}
                    </span>
                    <span className="text-sm font-semibold text-red-600">
                      {product.divergencePerc.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

