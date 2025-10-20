import { apiFetch } from "./client";
import type {
  CreateAddressGroupInput,
  UpdateAddressGroupInput,
  ListAddressGroupsQuery,
  PreviewAddressGroupRequest,
} from "../validation/address-groups";

export interface AddressGroup {
  id: string;
  name: string;
  depositId: string;
  physicalStructureSlug: string;
  streetPrefix: string | null;
  streetFrom: string;
  streetTo: string;
  columnFrom: number;
  columnTo: number;
  levelFrom: number;
  levelTo: number;
  palletFrom: number;
  palletTo: number;
  funcao: string;
  acessivelAMao: boolean;
  createdAt: string;
  updatedAt: string;
  // includes
  deposit?: { id: string; nome: string; codigo: string };
  physicalStructure?: { id: string; slug: string; titulo: string };
  _count?: { addresses: number };
}

export async function createAddressGroup(
  data: CreateAddressGroupInput,
): Promise<AddressGroup> {
  return apiFetch<AddressGroup>(`/address-groups`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAddressGroups(
  query?: ListAddressGroupsQuery,
): Promise<AddressGroup[]> {
  const params = new URLSearchParams();
  if (query?.depositId) params.set("depositId", query.depositId);
  if (query?.q) params.set("q", query.q);
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return apiFetch<AddressGroup[]>(`/address-groups${qs ? `?${qs}` : ""}`);
}

export async function getAddressGroup(id: string): Promise<AddressGroup> {
  return apiFetch<AddressGroup>(`/address-groups/${id}`);
}

export async function updateAddressGroup(
  id: string,
  data: UpdateAddressGroupInput,
): Promise<AddressGroup> {
  return apiFetch<AddressGroup>(`/address-groups/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteAddressGroup(id: string): Promise<void> {
  await apiFetch<void>(`/address-groups/${id}`, { method: "DELETE" });
}

export async function previewAddressGroup(
  id: string,
  data: PreviewAddressGroupRequest,
): Promise<{
  totalPrevisto: number;
  exemplos: Array<{
    enderecoCompleto: string;
    enderecoAbreviado: string;
    coordenadas: Record<string, number | string>;
  }>;
}> {
  return apiFetch(`/address-groups/${id}/generate/preview`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function generateAddressesFromGroup(
  id: string,
): Promise<{ totalPrevisto: number; criados: number }> {
  return apiFetch(`/address-groups/${id}/generate`, { method: "POST" });
}
