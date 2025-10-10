// ⚠️ MÓDULO SOMENTE LEITURA - Tipos para consulta de estoque

export interface Stock {
  id: string;
  productId: string;
  skuId: string | null;
  addressId: string;
  estabelecimento: string | null;
  deposito: string | null;
  lote: string | null;
  validade: string | null;
  fabricacao: string | null;
  documentoOrigem: string | null;
  status: 'DISPONIVEL' | 'RESERVADO' | 'BLOQUEADO' | 'QUARENTENA';
  observacao: string | null;
  attributes: Record<string, unknown> | null;

  // Campos de quantidade (sistema de alocação)
  quantidadeData: number;
  quantidadeAtual: number;
  quantidadeDisponivel: number;
  quantidadeAlocada: number;
  quantidadeAlocadaProducao: number;
  quantidadeAlocadaPedido: number;

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
    unitsPerSku: number;
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
  };
  sku: {
    id: string;
    description: string;
    unitsPerSku: number;
  } | null;
  address: {
    id: string;
    enderecoCompleto: string;
    enderecoAbreviado: string;
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
  totalQuantidadeAtual: number;
  totalQuantidadeDisponivel: number;
  totalQuantidadeAlocada: number;
  totalQuantidadeAlocadaProducao: number;
  totalQuantidadeAlocadaPedido: number;
}
