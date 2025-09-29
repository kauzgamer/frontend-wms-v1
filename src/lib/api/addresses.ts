import { apiFetch } from './client';
import type { AddressSummary, AddressDetail, CreateAddressInput, CreateAddressResponse } from '../types/addresses';

export function listAddresses(depositoId?: string) {
  const params = depositoId ? `?depositoId=${depositoId}` : '';
  return apiFetch<AddressSummary[]>(`/addresses${params}`);
}

export function getAddress(id: string) {
  return apiFetch<AddressDetail>(`/addresses/${id}`);
}

export function createAddresses(input: CreateAddressInput) {
  return apiFetch<CreateAddressResponse>('/addresses/bulk', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function previewAddresses(input: CreateAddressInput) {
  return apiFetch<CreateAddressResponse>('/addresses/preview', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateAddress(id: string, data: Partial<AddressDetail>) {
  return apiFetch<AddressDetail>(`/addresses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteAddress(id: string) {
  return apiFetch<void>(`/addresses/${id}`, {
    method: 'DELETE',
  });
}
