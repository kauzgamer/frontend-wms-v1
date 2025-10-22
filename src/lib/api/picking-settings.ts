import { apiFetch } from './client';

export interface PickingSettingsDTO {
  organizationId: string;
  depositId: string | null;
  useVerticalMovement: boolean;
  stockSwapMode: 'NAO' | 'IGUAIS' | 'QUALQUER';
  replenishMode: 'FALTANTE' | 'UNITIZADOR';
  reserveMoment: 'IMEDIATO' | 'POSTERIOR';
  allowPartialPicking: boolean;
  requestAttributesOnSelect: boolean;
  // Novas opções
  addressSelection: 'PICKING_FIRST' | 'STORAGE_FIRST' | 'ONLY_PICKING' | 'ONLY_STORAGE';
  stockSorting: 'FEFO' | 'FIFO' | 'NONE';
  splitMode: 'BY_ITEM' | 'BY_ADDRESS' | 'BY_PRODUCT';
  maxQtyPerTask: number | null | undefined;
  maxLinesPerTask: number | null | undefined;
}

export async function getPickingSettings(params: { organizationId: string; depositId?: string }) {
  const qs = new URLSearchParams();
  qs.set('organizationId', params.organizationId);
  if (params.depositId) qs.set('depositId', params.depositId);
  return apiFetch<PickingSettingsDTO>(`/picking-settings?${qs.toString()}`);
}

export async function upsertPickingSettings(data: Partial<PickingSettingsDTO> & { organizationId: string; depositId?: string }) {
  return apiFetch<PickingSettingsDTO>(`/picking-settings`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
