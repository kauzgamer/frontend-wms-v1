import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import {
  useInventory,
  useApplyInventoryAdjustments,
  usePreviewInventoryAdjustments,
} from "@/lib/hooks/use-inventory";
import {
  useInventoryStats,
  useInventoryDivergences,
  useAnalyzeDivergences,
} from "@/lib/hooks/use-inventory-advanced";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  Target, 
  Users, 
  Clock,
  TrendingUp,
  FileText,
} from "lucide-react";
import { InventoryAddressesTab } from "./tabs/addresses-tab";
import { InventoryDivergencesTab } from "./tabs/divergences-tab";
import { InventoryHistoryTab } from "./tabs/history-tab";
import { InventoryReportsTab } from "./tabs/reports-tab";

export default function InventarioDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { data: inventory, isLoading, error } = useInventory(id);
  const { data: stats } = useInventoryStats(id);
  const { data: divergencesData } = useInventoryDivergences(id, { page: 1, limit: 10 });
  const applyAdj = useApplyInventoryAdjustments();
  const previewAdj = usePreviewInventoryAdjustments();
  const analyzeDivMutation = useAnalyzeDivergences();
  const [activeTab, setActiveTab] = useState("addresses");

  if (isLoading) return <div className="p-6">Carregando…</div>;
  if (error)
    return <div className="p-6 text-red-600">Erro ao carregar inventário.</div>;
  if (!inventory) return <div className="p-6">Inventário não encontrado.</div>;

  const divergenceCount = divergencesData?.summary?.total ?? 0;

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold" style={{ color: "#4a5c60" }}>
            Inventário {inventory.identificador}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {inventory.descricao || "Sem descrição"}
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Button variant="outline" asChild>
            <Link to="/inventario">Voltar</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/inventario/${id}/ajustes`}>Histórico de ajustes</Link>
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              if (!id) return;
              try {
                await analyzeDivMutation.mutateAsync(id);
                alert("Análise de divergências concluída!");
              } catch {
                alert("Erro ao analisar divergências");
              }
            }}
            disabled={analyzeDivMutation.isPending}
          >
            {analyzeDivMutation.isPending ? "Analisando..." : "Analisar Divergências"}
          </Button>
          <Button
            onClick={async () => {
              if (!id) return;
              try {
                const res = await previewAdj.mutateAsync(id);
                const msg = `Pré-visualização:\n- Ajustes: ${res.adjusted}\n- Ignorados: ${res.skipped}\n- Problemas: ${res.issues?.length || 0}`;
                const proceed = confirm(`${msg}\n\nDeseja aplicar os ajustes agora?`);
                if (proceed) {
                  const applied = await applyAdj.mutateAsync(id);
                  alert(`Ajuste aplicado: ${applied.adjusted} ajustados, ${applied.skipped} ignorados.`);
                }
              } catch {
                alert("Falha ao pré-visualizar ajustes");
              }
            }}
            disabled={previewAdj.isPending || applyAdj.isPending}
          >
            {applyAdj.isPending ? "Aplicando..." : "Aplicar Ajustes"}
          </Button>
        </div>
      </div>

      {/* STATUS E PROGRESSO */}
      <div className="flex items-center gap-4">
        <Badge 
          variant={
            inventory.status === 'FINALIZADO' ? 'default' : 
            inventory.status === 'EM_ANDAMENTO' ? 'secondary' : 
            'outline'
          }
          className="text-sm py-1 px-3"
        >
          {inventory.status.replace(/_/g, ' ')}
        </Badge>
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-semibold">{inventory.progresso}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${inventory.progresso}%` }}
            />
          </div>
        </div>
      </div>

      {/* ESTATÍSTICAS */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<MapPin className="h-5 w-5" />}
          label="Total de Endereços"
          value={stats?.totalAddresses ?? 0}
          variant="default"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Endereços Contados"
          value={stats?.countedAddresses ?? 0}
          subtitle={`${stats?.pendingAddresses ?? 0} pendentes`}
          variant="success"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Divergências"
          value={divergenceCount}
          subtitle={divergenceCount > 0 ? "Requer atenção" : "Nenhuma"}
          variant={divergenceCount > 0 ? "warning" : "success"}
        />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Acuracidade"
          value={`${(stats?.accuracyRate ?? 0).toFixed(1)}%`}
          variant={
            (stats?.accuracyRate ?? 0) >= 95 ? "success" : 
            (stats?.accuracyRate ?? 0) >= 85 ? "warning" : 
            "danger"
          }
        />
      </div>

      {/* INFORMAÇÕES ADICIONAIS */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Operadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueOperators}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalCounts} contagens realizadas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Tempo Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avgCountTime ? `${stats.avgCountTime.toFixed(0)}min` : '-'}
              </div>
              <p className="text-xs text-muted-foreground">
                Por endereço
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Estimativa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.estimatedCompletion ? new Date(stats.estimatedCompletion).toLocaleDateString() : '-'}
              </div>
              <p className="text-xs text-muted-foreground">
                Conclusão prevista
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="addresses">
            <MapPin className="h-4 w-4 mr-2" />
            Endereços
          </TabsTrigger>
          <TabsTrigger value="divergences">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Divergências ({divergenceCount})
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="addresses" className="mt-6">
          <InventoryAddressesTab inventoryId={id!} />
        </TabsContent>

        <TabsContent value="divergences" className="mt-6">
          <InventoryDivergencesTab inventoryId={id!} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <InventoryHistoryTab inventoryId={id!} />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <InventoryReportsTab inventoryId={id!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

function StatCard({ icon, label, value, subtitle, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "border-gray-200",
    success: "border-green-200 bg-green-50",
    warning: "border-yellow-200 bg-yellow-50",
    danger: "border-red-200 bg-red-50",
  };

  const iconStyles = {
    default: "text-gray-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600",
  };

  return (
    <Card className={variantStyles[variant]}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-sm font-medium">{label}</CardDescription>
          <div className={iconStyles[variant]}>{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
