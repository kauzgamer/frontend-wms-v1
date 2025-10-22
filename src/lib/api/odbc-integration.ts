import { apiFetch } from './client';
import type {
  OdbcIntegrationConfig,
  UpsertOdbcIntegrationConfigInput,
  TestOdbcConnectionPayload,
  OdbcTestResponse,
  OdbcSyncRequest,
  OdbcSyncResult,
  OdbcImportResponse,
} from '../types/odbc-integration';

export async function listOdbcConfigs() {
  return apiFetch<OdbcIntegrationConfig[]>('/odbc-integration/configs');
}

export async function getOdbcConfig(id: string) {
  return apiFetch<OdbcIntegrationConfig>(`/odbc-integration/configs/${id}`);
}

export async function createOdbcConfig(data: UpsertOdbcIntegrationConfigInput) {
  return apiFetch<OdbcIntegrationConfig>('/odbc-integration/configs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateOdbcConfig(
  id: string,
  data: Partial<UpsertOdbcIntegrationConfigInput>,
) {
  return apiFetch<OdbcIntegrationConfig>(`/odbc-integration/configs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteOdbcConfig(id: string) {
  return apiFetch<void>(`/odbc-integration/configs/${id}`, {
    method: 'DELETE',
  });
}

export async function testOdbcConnection(payload: TestOdbcConnectionPayload) {
  return apiFetch<OdbcTestResponse>('/odbc-integration/test-connection', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function triggerOdbcImport(payload: TestOdbcConnectionPayload) {
  return apiFetch<OdbcImportResponse>('/odbc-integration/staged/import', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function triggerOdbcSync(payload: OdbcSyncRequest) {
  return apiFetch<OdbcSyncResult>('/odbc-integration/sync-products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ===============================
// Nova arquitetura (Desktop Agent)
// Endpoints existentes no backend:
//  - POST /odbc-integration/staged/process { batchId, stage }
//  - GET  /odbc-integration/staged/batch/:batchId/status
//  - GET  /odbc-integration/logs
// ===============================

export type OdbcStage = 'categories' | 'products' | 'skus' | 'shipments' | 'stock-movements';

export interface OdbcProcessResponse {
  stage: OdbcStage | string;
  processed: number;
  errors: number;
  details: string[];
}

export interface OdbcBatchStatus {
  batchId: string;
  total: number;
  completed: number;
  pending: number;
  stages: {
    categories: { processed: number; total: number };
    products: { processed: number; total: number };
    skus: { processed: number; total: number };
    shipments?: { processed: number; total: number };
    stockMovements?: { processed: number; total: number };
  };
}

export async function processStage(payload: { batchId: string; stage: OdbcStage }) {
  return apiFetch<OdbcProcessResponse>('/odbc-integration/staged/process', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getBatchStatus(batchId: string) {
  return apiFetch<OdbcBatchStatus>(`/odbc-integration/staged/batch/${batchId}/status`);
}

export interface OdbcLogItem {
  id: string;
  date: string;
  document: string;
  key: string;
  process: string;
  status: 'success' | 'failed' | 'quarantine';
  details?: string;
  errorMessage?: string;
  productsCount?: number;
}

export async function getOdbcLogs(params?: { organizationId?: string }) {
  const qs = params?.organizationId ? `?organizationId=${encodeURIComponent(params.organizationId)}` : '';
  return apiFetch<OdbcLogItem[]>(`/odbc-integration/logs${qs}`);
}