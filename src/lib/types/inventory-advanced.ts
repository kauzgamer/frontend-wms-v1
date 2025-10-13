// Tipos avançados para o módulo de inventário

export interface InventoryAuditLog {
  id: string;
  inventoryId: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string;
  changes?: any;
  metadata?: any;
  timestamp: string;
}

export interface InventoryDivergence {
  id: string;
  inventoryId: string;
  inventoryAddressId: string;
  productId: string;
  skuId: string | null;
  addressLabel: string;
  productName: string;
  expectedQty: number;
  countedQty: number;
  divergenceQty: number;
  divergencePerc: number;
  divergenceType: 'SOBRA' | 'FALTA' | 'PRODUTO_ERRADO' | 'ENDERECO_ERRADO';
  severity: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  status: 'PENDENTE' | 'EM_ANALISE' | 'APROVADA' | 'REJEITADA';
  cause: string | null;
  responsible: string | null;
  action: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
}

export interface InventoryDivergencesSummary {
  total: number;
  pending: number;
  inAnalysis: number;
  approved: number;
  rejected: number;
  bySeverity: {
    baixa: number;
    media: number;
    alta: number;
    critica: number;
  };
  byType: {
    sobra: number;
    falta: number;
    produtoErrado: number;
    enderecoErrado: number;
  };
}

export interface InventoryStats {
  inventoryId: string;
  totalAddresses: number;
  countedAddresses: number;
  pendingAddresses: number;
  divergentAddresses: number;
  accuracyRate: number;
  avgCountTime: number | null;
  totalCounts: number;
  uniqueOperators: number;
  startedAt: string | null;
  estimatedCompletion: string | null;
}

export interface InventoryAccuracyReport {
  inventoryId: string;
  totalAddresses: number;
  accurateAddresses: number;
  divergentAddresses: number;
  accuracyRate: number;
  avgDivergenceValue: number;
  totalDivergenceValue: number;
  byProduct: Array<{
    productId: string;
    productName: string;
    totalDivergence: number;
    divergencePerc: number;
  }>;
}

export interface InventoryOperatorPerformance {
  userId: string;
  userName: string;
  addressesCounted: number;
  avgTimePerAddress: number;
  accuracyRate: number;
  divergencesFound: number;
  lastCountAt: string | null;
}

export interface InventoryDailyProgress {
  date: string;
  counted: number;
  target: number;
  cumulative: number;
}

export interface InventoryReport {
  inventory: {
    id: string;
    identificador: string;
    descricao: string;
    status: string;
    progresso: number;
    createdAt: string;
  };
  stats: InventoryStats;
  accuracy: InventoryAccuracyReport;
  operatorPerformance: InventoryOperatorPerformance[];
  dailyProgress: InventoryDailyProgress[];
  divergencesByType: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export interface InventoryApproval {
  id: string;
  inventoryId: string;
  level: number;
  approverRole: string;
  approverId: string | null;
  approverName: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments: string | null;
  approvedAt: string | null;
  createdAt: string;
}

