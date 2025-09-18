import type { Sku } from './sku'

export interface Product {
  id: string
  name: string
  sku: string
  createdAt: string
  updatedAt: string
  skus?: Sku[]
}

export type ProductWithSkus = Product & { skus: Sku[] }

export type ProductCreateInput = {
  name: string
  sku: string
}
