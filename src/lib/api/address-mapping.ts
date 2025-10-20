import { apiFetch } from './client';
import type {
  AddressMappingSummary,
  CreateAddressMappingInput,
  UpdateAddressMappingInput,
} from '../types/address-mapping';

export async function listAddressMappings(params?: { q?: string; situacao?: 'ATIVO' | 'INATIVO' }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set('q', params.q);
  if (params?.situacao) qs.set('situacao', params.situacao);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch<AddressMappingSummary[]>(`/address-mapping${suffix}`);
}

export async function createAddressMapping(data: CreateAddressMappingInput) {
  return apiFetch<AddressMappingSummary>('/address-mapping', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAddressMapping(id: string, data: UpdateAddressMappingInput) {
  return apiFetch<AddressMappingSummary>(`/address-mapping/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteAddressMapping(id: string) {
  return apiFetch<void>(`/address-mapping/${id}`, { method: 'DELETE' });
}
