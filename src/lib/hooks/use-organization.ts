import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Organization } from "@/lib/types/organization";

export function useOrganization() {
  return useQuery({
    queryKey: ["organization"],
    queryFn: () => apiFetch<Organization | null>("/organization"),
  });
}

export function useDeposits() {
  return useQuery({
    queryKey: ["organization", "deposits"],
    queryFn: () =>
      apiFetch<
        Array<{ id: string; nome: string; codigo: string; principal: boolean }>
      >("/organization/deposits"),
  });
}
