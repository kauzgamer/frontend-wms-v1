import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listAuditLogs,
  analyzeDivergences,
  listDivergences,
  reviewDivergence,
  getInventoryStats,
  getInventoryReport,
  listApprovals,
  approveInventory,
} from '../api/inventory-advanced';

// ========================================
// Audit Logs
// ========================================
export function useInventoryAuditLogs(
  inventoryId: string | undefined,
  params?: {
    page?: number;
    limit?: number;
    action?: string;
    entity?: string;
    userId?: string;
  }
) {
  return useQuery({
    queryKey: ['inventory', inventoryId, 'audit-logs', params],
    queryFn: () => listAuditLogs(inventoryId!, params),
    enabled: !!inventoryId,
    staleTime: 30000, // 30 segundos
  });
}

// ========================================
// Divergências
// ========================================
export function useAnalyzeDivergences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inventoryId: string) => analyzeDivergences(inventoryId),
    onSuccess: (_, inventoryId) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['inventory', inventoryId, 'divergences'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', inventoryId, 'stats'] });
    },
  });
}

export function useInventoryDivergences(
  inventoryId: string | undefined,
  params?: {
    page?: number;
    limit?: number;
    status?: 'PENDENTE' | 'EM_ANALISE' | 'APROVADA' | 'REJEITADA' | 'TODOS';
    severity?: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA' | 'TODOS';
    divergenceType?: 'SOBRA' | 'FALTA' | 'PRODUTO_ERRADO' | 'ENDERECO_ERRADO' | 'TODOS';
  }
) {
  return useQuery({
    queryKey: ['inventory', inventoryId, 'divergences', params],
    queryFn: () => listDivergences(inventoryId!, params),
    enabled: !!inventoryId,
    staleTime: 10000, // 10 segundos
  });
}

export function useReviewDivergence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      divergenceId,
      data,
    }: {
      divergenceId: string;
      data: {
        cause: 'ERRO_CONTAGEM' | 'PRODUTO_AVARIADO' | 'FURTO' | 'ERRO_SISTEMA' | 'MOVIMENTACAO_NAO_LANCADA' | 'OUTRO';
        responsible?: string;
        action: string;
        status: 'EM_ANALISE' | 'APROVADA' | 'REJEITADA';
      };
    }) => reviewDivergence(divergenceId, data),
    onSuccess: () => {
      // Invalidar todas as queries de divergências
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

// ========================================
// Relatórios e Analytics
// ========================================
export function useInventoryStats(inventoryId: string | undefined) {
  return useQuery({
    queryKey: ['inventory', inventoryId, 'stats'],
    queryFn: () => getInventoryStats(inventoryId!),
    enabled: !!inventoryId,
    staleTime: 30000, // 30 segundos
  });
}

export function useInventoryReport(inventoryId: string | undefined) {
  return useQuery({
    queryKey: ['inventory', inventoryId, 'report'],
    queryFn: () => getInventoryReport(inventoryId!),
    enabled: !!inventoryId,
    staleTime: 60000, // 1 minuto
  });
}

// ========================================
// Aprovações
// ========================================
export function useInventoryApprovals(
  inventoryId: string | undefined,
  params?: {
    page?: number;
    limit?: number;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';
    level?: number;
  }
) {
  return useQuery({
    queryKey: ['inventory', inventoryId, 'approvals', params],
    queryFn: () => listApprovals(inventoryId!, params),
    enabled: !!inventoryId,
    staleTime: 10000,
  });
}

export function useApproveInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      approvalId: string;
      status: 'APPROVED' | 'REJECTED';
      comments?: string;
    }) => approveInventory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

