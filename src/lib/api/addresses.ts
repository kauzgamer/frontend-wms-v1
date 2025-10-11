import { apiFetch } from './client';
import type { AddressSummary, AddressDetail, CreateAddressInput, CreateAddressResponse, AddressPreview } from '../types/addresses';

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

export async function previewAddresses(params: { depositoId: string; estruturaFisicaId: string; coordenadas: Array<{ tipo: string; nome: string; abrev: string; inicio: string | number; fim: string | number }> }): Promise<AddressPreview[]> {
  const result = await apiFetch<{ total: number; enderecos: Array<{ enderecoCompleto: string; enderecoAbreviado: string; alcance: unknown }> }>('/addresses/preview', {
    method: 'POST',
    body: JSON.stringify(params),
  })
  // O backend já retorna no formato correto
  return result.enderecos.map(end => ({
    enderecoCompleto: end.enderecoCompleto,
    enderecoAbreviado: end.enderecoAbreviado,
    alcance: end.alcance as 'ACESSÍVEL A MÃO' | 'NÃO ACESSÍVEL A MÃO',
  }))
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
