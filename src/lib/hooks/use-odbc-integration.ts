import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listOdbcConfigs,
  createOdbcConfig,
  updateOdbcConfig,
  deleteOdbcConfig,
  testOdbcConnection,
  triggerOdbcImport,
  triggerOdbcSync,
  processStage,
  getBatchStatus,
  getOdbcLogs,
} from '../api/odbc-integration';
import type {
  OdbcIntegrationConfig,
  UpsertOdbcIntegrationConfigInput,
  TestOdbcConnectionPayload,
  OdbcSyncRequest,
} from '../types/odbc-integration';

const CONFIGS_QUERY_KEY = ['odbc-integration', 'configs'] as const;

export function useOdbcConfigs() {
  return useQuery<OdbcIntegrationConfig[]>({
    queryKey: CONFIGS_QUERY_KEY,
    queryFn: listOdbcConfigs,
    staleTime: 60_000,
  });
}

export function useCreateOdbcConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertOdbcIntegrationConfigInput) => createOdbcConfig(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONFIGS_QUERY_KEY });
    },
  });
}

export function useUpdateOdbcConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<UpsertOdbcIntegrationConfigInput>;
    }) => updateOdbcConfig(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONFIGS_QUERY_KEY });
    },
  });
}

export function useDeleteOdbcConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOdbcConfig(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONFIGS_QUERY_KEY });
    },
  });
}

export function useTestOdbcConnection() {
  return useMutation({
    mutationFn: (payload: TestOdbcConnectionPayload) => testOdbcConnection(payload),
  });
}

export function useTriggerOdbcImport() {
  return useMutation({
    mutationFn: (payload: TestOdbcConnectionPayload) => triggerOdbcImport(payload),
  });
}

export function useTriggerOdbcSync() {
  return useMutation({
    mutationFn: (payload: OdbcSyncRequest) => triggerOdbcSync(payload),
  });
}

// ===============================
// Nova arquitetura (Desktop Agent)
// ===============================

export function useProcessStage() {
  return useMutation({
    mutationFn: (payload: { batchId: string; stage: 'categories' | 'products' | 'skus' }) => processStage(payload),
  });
}

export function useBatchStatus(batchId?: string) {
  return useQuery({
    queryKey: ['odbc-integration', 'batch-status', batchId],
    queryFn: () => (batchId ? getBatchStatus(batchId) : Promise.resolve(null)),
    enabled: !!batchId,
    staleTime: 15_000,
  });
}

export function useOdbcLogs(params?: { organizationId?: string }) {
  return useQuery({
    queryKey: ['odbc-integration', 'logs', params?.organizationId ?? 'all'],
    queryFn: () => getOdbcLogs(params),
    staleTime: 30_000,
  });
}