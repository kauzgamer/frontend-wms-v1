import { apiFetch } from './client';
import type {
  InventoryAuditLog,
  InventoryDivergence,
  InventoryDivergencesSummary,
  InventoryStats,
  InventoryReport,
  InventoryApproval,
} from '../types/inventory-advanced';

// Helper to build query string
function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

// ========================================
// Audit Logs
// ========================================
export async function listAuditLogs(
  inventoryId: string,
  params?: {
    page?: number;
    limit?: number;
    action?: string;
    entity?: string;
    userId?: string;
  }
) {
  const queryString = buildQueryString(params);
  return apiFetch<{
    data: InventoryAuditLog[];
    meta: { page: number; limit: number; total: number };
  }>(`/inventory/${inventoryId}/audit-logs${queryString}`);
}

// ========================================
// Divergências
// ========================================
export async function analyzeDivergences(inventoryId: string) {
  return apiFetch<{
    ok: boolean;
    divergencesFound: number;
  }>(`/inventory/${inventoryId}/divergences/analyze`, {
    method: 'POST',
  });
}

export async function listDivergences(
  inventoryId: string,
  params?: {
    page?: number;
    limit?: number;
    status?: 'PENDENTE' | 'EM_ANALISE' | 'APROVADA' | 'REJEITADA' | 'TODOS';
    severity?: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA' | 'TODOS';
    divergenceType?: 'SOBRA' | 'FALTA' | 'PRODUTO_ERRADO' | 'ENDERECO_ERRADO' | 'TODOS';
  }
) {
  const queryString = buildQueryString(params);
  return apiFetch<{
    data: InventoryDivergence[];
    meta: { page: number; limit: number; total: number };
    summary: InventoryDivergencesSummary;
  }>(`/inventory/${inventoryId}/divergences${queryString}`);
}

export async function reviewDivergence(
  divergenceId: string,
  data: {
    cause: 'ERRO_CONTAGEM' | 'PRODUTO_AVARIADO' | 'FURTO' | 'ERRO_SISTEMA' | 'MOVIMENTACAO_NAO_LANCADA' | 'OUTRO';
    responsible?: string;
    action: string;
    status: 'EM_ANALISE' | 'APROVADA' | 'REJEITADA';
  }
) {
  return apiFetch<{
    ok: boolean;
    divergenceId: string;
    status: string;
  }>(`/inventory/divergences/${divergenceId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ========================================
// Relatórios e Analytics
// ========================================
export async function getInventoryStats(inventoryId: string) {
  return apiFetch<InventoryStats>(
    `/inventory/${inventoryId}/stats`
  );
}

export async function getInventoryReport(inventoryId: string) {
  return apiFetch<InventoryReport>(
    `/inventory/${inventoryId}/report`
  );
}

// ========================================
// Aprovações
// ========================================
export async function listApprovals(
  inventoryId: string,
  params?: {
    page?: number;
    limit?: number;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';
    level?: number;
  }
) {
  const queryString = buildQueryString(params);
  return apiFetch<{
    data: InventoryApproval[];
    meta: { page: number; limit: number; total: number };
  }>(`/inventory/${inventoryId}/approvals${queryString}`);
}

export async function approveInventory(data: {
  approvalId: string;
  status: 'APPROVED' | 'REJECTED';
  comments?: string;
}) {
  return apiFetch<{
    ok: boolean;
    approvalId: string;
    status: string;
  }>('/inventory/approvals/approve', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
