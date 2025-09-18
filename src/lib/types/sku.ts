export interface Dimensions {
  height?: number
  width?: number
  length?: number
  weightKg?: number
  lastro?: number
  camadas?: number
}

export interface Barcode {
  id: string
  code: string
}

export interface Sku {
  id: string
  description: string
  unitsPerSku: number
  fractional: boolean
  generatePickingLabel: boolean
  barcodes: Barcode[]
  dimensions?: Dimensions
  createdAt: string
  updatedAt: string
}
