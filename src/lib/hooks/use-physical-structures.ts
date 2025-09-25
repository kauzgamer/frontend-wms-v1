import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPhysicalStructure, listPhysicalStructures, updatePhysicalStructure } from '../api/physical-structures';
import type { PhysicalStructureDetail, PhysicalStructureSummary, UpdatePhysicalStructureInput } from '../types/physical-structures';

export function usePhysicalStructures() {
  return useQuery<PhysicalStructureSummary[]>({
    queryKey: ['physical-structures'],
    queryFn: () => listPhysicalStructures(),
  });
}

export function usePhysicalStructure(slug: string) {
  return useQuery<PhysicalStructureDetail>({
    queryKey: ['physical-structures', slug],
    queryFn: () => getPhysicalStructure(slug),
    enabled: !!slug,
  });
}

export function useUpdatePhysicalStructure(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePhysicalStructureInput) => updatePhysicalStructure(slug, input),
    onSuccess: (data) => {
      qc.setQueryData(['physical-structures', slug], data);
      qc.invalidateQueries({ queryKey: ['physical-structures'] });
    },
  });
}

export function useUpdateAnyPhysicalStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { slug: string; input: UpdatePhysicalStructureInput }) =>
      updatePhysicalStructure(vars.slug, vars.input),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['physical-structures'] });
      qc.invalidateQueries({ queryKey: ['physical-structures', vars.slug] });
    },
  });
}
