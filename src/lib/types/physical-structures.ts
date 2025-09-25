export type OrigemTipo = 'PADRÃO' | 'ALTERADO';

export type Situacao = 'ATIVO' | 'INATIVO';

export type CoordKey = 'B' | 'R' | 'C' | 'A' | 'AP';

export interface CoordConfig {
  ativo: boolean;
  nomePadrao: string;
  abrevPadrao: string;
  editarNome: boolean;
  nomeCustom?: string;
  editarAbrev: boolean;
  abrevCustom?: string;
}

export interface PhysicalStructureSummary {
  id: string; // slug
  titulo: string;
  descricao: string;
  origem: OrigemTipo;
  situacao: Situacao;
  createdAt?: string;
  updatedAt?: string;
}

export interface PhysicalStructureDetail {
  id: string;
  titulo: string;
  origem: OrigemTipo;
  situacao: Situacao;
  descricao: string;
  colunaDefineLadoRua: boolean;
  coords: Record<CoordKey, CoordConfig>;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdatePhysicalStructureInput {
  ativo?: boolean;
  restaurarPadrao?: boolean;
  colunaDefineLadoRua?: boolean;
  B?: Partial<CoordConfig>;
  R?: Partial<CoordConfig>;
  C?: Partial<CoordConfig>;
  A?: Partial<CoordConfig>;
  AP?: Partial<CoordConfig>;
}
