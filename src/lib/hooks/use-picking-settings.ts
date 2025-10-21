import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPickingSettings, upsertPickingSettings, type PickingSettingsDTO } from '@/lib/api/picking-settings';

export function usePickingSettings(params: { organizationId: string | undefined; depositId?: string | undefined }) {
  const { organizationId, depositId } = params;
  return useQuery({
    queryKey: ['picking-settings', { organizationId, depositId }],
    queryFn: () => getPickingSettings({ organizationId: organizationId!, depositId }),
    enabled: !!organizationId,
    staleTime: 15_000,
  });
}

export function useUpsertPickingSettings(params: { organizationId: string | undefined; depositId?: string | undefined }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<PickingSettingsDTO>) =>
      upsertPickingSettings({ ...patch, organizationId: params.organizationId!, depositId: params.depositId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['picking-settings'] });
    },
  });
}
