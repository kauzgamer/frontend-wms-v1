export type StockTypeSituation = 'ATIVO' | 'INATIVO';

export interface StockTypeItem {
  id: string;
  descricao: string;
  usarNaExpedicao: boolean;
  usarNaManufatura: boolean;
  situacao: StockTypeSituation;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStockTypeInput {
  descricao: string;
  usarNaExpedicao?: boolean;
  usarNaManufatura?: boolean;
  situacao?: StockTypeSituation;
}

export type UpdateStockTypeInput = Partial<CreateStockTypeInput>;
