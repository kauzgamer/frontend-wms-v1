export type OrigemTipo = 'PADRÃO' | 'ALTERADO';

export type Situacao = 'ATIVO' | 'INATIVO';

export type CoordKey = string; // Agora é uma string para suportar mais tipos

export interface CoordConfig {
  ativo: boolean;
  tipo: string; // Tipo da coordenada (B, R, C, A, AP, SE, Q, etc.)
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
  coordDefaults?: Record<string, { from: string | number; to: string | number; prefix?: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdatePhysicalStructureInput {
  ativo?: boolean;
  restaurarPadrao?: boolean;
  colunaDefineLadoRua?: boolean;
  coordenadas?: Record<string, Partial<CoordConfig>>;
}
