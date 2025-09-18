export interface Product {
  id: string
  name: string
  sku: string
  createdAt: string
  updatedAt: string
}

export type ProductCreateInput = {
  name: string
  sku: string
}
