export type MappingSituation = 'ATIVO' | 'INATIVO';

export type MappingStockType = 'Genérico' | 'Específico' | 'Picking' | 'Armazenagem';

export interface AddressMappingSummary {
  id: string;
  descricao: string;
  categoriaProduto?: string;
  produto?: string;
  stockTypeId?: string | null;
  stockTypeDescricao?: string | null;
  tipoEstoque: MappingStockType;
  nivelEspecificacao: 'Genérico' | 'Específico';
  situacao: MappingSituation;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressMappingInput {
  descricao: string;
  categoriaProdutoId?: string;
  produtoId?: string;
  stockTypeId?: string;
  tipoEstoque: MappingStockType;
  nivelEspecificacao: 'Genérico' | 'Específico';
  situacao?: MappingSituation;
}

export type UpdateAddressMappingInput = Partial<CreateAddressMappingInput>;
