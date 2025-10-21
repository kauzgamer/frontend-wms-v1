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