import { apiFetch } from './client';
import type {
  PhysicalStructureDetail,
  PhysicalStructureSummary,
  UpdatePhysicalStructureInput,
} from '../types/physical-structures';

export function listPhysicalStructures() {
  return apiFetch<PhysicalStructureSummary[]>('/physical-structures');
}

export function getPhysicalStructure(slug: string) {
  return apiFetch<PhysicalStructureDetail>(`/physical-structures/${slug}`);
}

export function updatePhysicalStructure(slug: string, body: UpdatePhysicalStructureInput) {
  return apiFetch<PhysicalStructureDetail>(`/physical-structures/${slug}` , {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
