import { useQuery } from '@tanstack/react-query'
import { getInventoryDashboard, listInventories } from '../api/inventory'
import type { ListInventoriesParams, ListInventoriesResponse, InventoryDashboard } from '../types/inventory'

export function useInventoryDashboard() {
  return useQuery<InventoryDashboard>({
    queryKey: ['inventory', 'dashboard'],
    queryFn: getInventoryDashboard,
    staleTime: 30_000,
  })
}

export function useInventories(params: ListInventoriesParams) {
  return useQuery<ListInventoriesResponse>({
    queryKey: ['inventory', params],
    queryFn: () => listInventories(params),
    // v5: substitui keepPreviousData por placeholderData que reutiliza o último valor
    placeholderData: (prev) => prev,
    staleTime: 15_000,
  })
}
