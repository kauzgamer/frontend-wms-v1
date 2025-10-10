export interface Stock {
  id: string;
  productId: string;
  skuId: string | null;
  addressId: string;
  lote: string | null;
  quantity: number;
  quantityReserved: number;
  quantityAvailable: number;
  unitOfMeasure: string | null;
  validade: string | null;
  fabricacao: string | null;
  documentoOrigem: string | null;
  status: 'DISPONIVEL' | 'RESERVADO' | 'BLOQUEADO' | 'AVARIADO';
  attributes: Record<string, string | number> | null;
  observacao: string | null;
  createdAt: string;
  updatedAt: string;

  // Relações opcionais
  product?: {
    id: string;
    name: string | null;
    sku: string | null;
  };
  sku?: {
    id: string;
    description: string;
  } | null;
  address?: {
    id: string;
    enderecoCompleto: string;
    enderecoAbreviado: string;
  };
}

export interface StockWithDetails extends Stock {
  product: {
    id: string;
    name: string | null;
    sku: string | null;
    unitOfMeasure: string | null;
  };
  sku: {
    id: string;
    description: string;
  } | null;
  address: {
    id: string;
    enderecoCompleto: string;
    enderecoAbreviado: string;
    deposito: string;
    situacao: string;
  };
}

export interface StockListResponse {
  data: StockWithDetails[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductStockTotal {
  productId: string;
  totalQuantity: number;
  totalReserved: number;
  totalAvailable: number;
}
