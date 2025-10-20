import { apiFetch } from "./client";
import type {
  AddressSummary,
  AddressDetail,
  CreateAddressInput,
  CreateAddressResponse,
  AddressPreview,
} from "../types/addresses";

export function listAddresses(params?: {
  depositoId?: string;
  funcao?: string;
  acessivelAMao?: boolean;
}) {
  const qs = new URLSearchParams();
  if (params?.depositoId) qs.set("depositoId", params.depositoId);
  if (params?.funcao) qs.set("funcao", params.funcao);
  if (typeof params?.acessivelAMao === "boolean")
    qs.set("acessivelAMao", String(params.acessivelAMao));
  const suffix = Array.from(qs.keys()).length ? `?${qs.toString()}` : "";
  return apiFetch<AddressSummary[]>(`/addresses${suffix}`);
}

export function getAddress(id: string) {
  return apiFetch<AddressDetail>(`/addresses/${id}`);
}

export function createAddresses(input: CreateAddressInput) {
  return apiFetch<CreateAddressResponse>("/addresses/bulk", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function previewAddresses(params: {
  depositoId: string;
  estruturaFisicaId: string;
  coordenadas: Array<{
    tipo: string;
    nome: string;
    abrev: string;
    inicio: string | number;
    fim: string | number;
  }>;
}): Promise<AddressPreview[]> {
  const result = await apiFetch<{
    total: number;
    enderecos: Array<{
      enderecoCompleto: string;
      enderecoAbreviado: string;
      alcance: unknown;
    }>;
  }>("/addresses/preview", {
    method: "POST",
    body: JSON.stringify(params),
  });
  // O backend já retorna no formato correto
  return result.enderecos.map((end) => ({
    enderecoCompleto: end.enderecoCompleto,
    enderecoAbreviado: end.enderecoAbreviado,
    alcance: end.alcance as "ACESSÍVEL A MÃO" | "NÃO ACESSÍVEL A MÃO",
  }));
}

export function updateAddress(id: string, data: Partial<AddressDetail>) {
  return apiFetch<AddressDetail>(`/addresses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteAddress(id: string) {
  return apiFetch<void>(`/addresses/${id}`, {
    method: "DELETE",
  });
}

export function getStreetsByDeposit(depositoId: string) {
  return apiFetch<string[]>(`/addresses/streets/${depositoId}`);
}

export function getAddressesByStreet(
  depositoId: string,
  street: string,
  opts?: {
    funcao?: string;
    acessivelAMao?: boolean;
    page?: number;
    limit?: number;
  }
) {
  const params = new URLSearchParams();
  params.set("depositoId", depositoId);
  params.set("street", street ?? "");
  if (opts?.funcao) params.set("funcao", opts.funcao);
  if (typeof opts?.acessivelAMao === "boolean")
    params.set("acessivelAMao", String(opts.acessivelAMao));
  if (typeof opts?.page === "number") params.set("page", String(opts.page));
  if (typeof opts?.limit === "number") params.set("limit", String(opts.limit));
  return apiFetch<
    Array<{
      id: string;
      enderecoCompleto: string;
      enderecoAbreviado: string;
      funcao: string;
      acessivelAMao: boolean;
      situacao: string;
    }>
  >(`/addresses/by-street?${params.toString()}`);
}
