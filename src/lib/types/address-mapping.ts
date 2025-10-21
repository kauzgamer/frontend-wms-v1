export type MappingSituation = 'ATIVO' | 'INATIVO';

// Tipo apresentado na listagem (friendly). Para criação/edição use os enums do backend abaixo.
export type MappingStockType = 'Picking' | 'Armazenagem';

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
  // Enums do backend (opcionais, com defaults no servidor)
  tipoEstoque?: 'ARMAZENAGEM' | 'PICKING';
  nivelEspecificacao?: 'GENERICO' | 'ESPECIFICO';
  situacao?: MappingSituation;
  prioridades?: Array<{ prioridade: number; groupId: string; filtro?: Record<string, unknown> }>;
}

export type UpdateAddressMappingInput = Partial<CreateAddressMappingInput>;
