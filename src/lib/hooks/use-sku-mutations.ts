import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Sku, Dimensions } from '@/lib/types/sku'

function invalidateProduct(qc: ReturnType<typeof useQueryClient>, productId: string) {
  qc.invalidateQueries({ queryKey: ['product', productId] })
  qc.invalidateQueries({ queryKey: ['products'] })
}

export function useAddSku(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { description: string; unitsPerSku: number; fractional?: boolean; generatePickingLabel?: boolean }) =>
      apiFetch<Sku>(`/products/${productId}/skus`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => invalidateProduct(qc, productId),
  })
}

export function useUpdateSku(productId: string, skuId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<{ description: string; unitsPerSku: number; fractional: boolean; generatePickingLabel: boolean }>) =>
      apiFetch<Sku>(`/products/${productId}/skus/${skuId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => invalidateProduct(qc, productId),
  })
}

export function useDeleteSku(productId: string, skuId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiFetch<void>(`/products/${productId}/skus/${skuId}`, { method: 'DELETE' }),
    onSuccess: () => invalidateProduct(qc, productId),
  })
}

export function useAddBarcode(productId: string, skuId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (code: string) =>
      apiFetch(`/products/${productId}/skus/${skuId}/barcodes`, {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),
    onSuccess: () => invalidateProduct(qc, productId),
  })
}

export function useDeleteBarcode(productId: string, skuId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (barcodeId: string) =>
      apiFetch<void>(`/products/${productId}/skus/${skuId}/barcodes/${barcodeId}`, { method: 'DELETE' }),
    onSuccess: () => invalidateProduct(qc, productId),
  })
}

export function useUpdateDimensions(productId: string, skuId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dims: Dimensions) =>
      apiFetch<Sku>(`/products/${productId}/skus/${skuId}/dimensions`, {
        method: 'PATCH',
        body: JSON.stringify(dims),
      }),
    onSuccess: () => invalidateProduct(qc, productId),
  })
}
