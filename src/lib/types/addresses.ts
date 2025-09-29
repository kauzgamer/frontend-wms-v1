export type AddressSituation = 'ATIVO' | 'BLOQUEADO';

export type PhysicalStructureType = 
  | 'Blocado funcional'
  | 'Porta palete'
  | 'Blocado armazenagem'
  | 'Doca'
  | 'Stage'
  | 'Produção';

export type AddressFunction = 
  | 'Stage'
  | 'Doca'
  | 'Produção'
  | 'Picking'
  | 'Armazenagem';

export interface AddressSummary {
  id: string;
  depositoId: string;
  deposito: string;
  enderecoCompleto: string;
  enderecoAbreviado: string;
  estruturaFisica: PhysicalStructureType;
  funcao: AddressFunction;
  acessivelAMao: boolean;
  situacao: AddressSituation;
  createdAt: string;
  updatedAt: string;
}

export interface AddressDetail extends AddressSummary {
  unitizador?: string;
  peso?: number;
  altura?: number;
  largura?: number;
  comprimento?: number;
}

// Coordenada dinâmica baseada na estrutura física
export interface CoordinateRange {
  tipo: string; // Ex: 'R', 'C', 'N', 'P', 'B', 'SE', 'Q', etc.
  nome: string; // Nome da coordenada (ex: "Rua", "Coluna", "Nível")
  abrev: string; // Abreviação (ex: "R", "C", "N")
  inicio: string | number;
  fim: string | number;
  usarPrefixo?: boolean;
  acessiveisAMao?: (string | number)[]; // Para níveis que podem ser acessíveis à mão
}

export interface CreateAddressInput {
  depositoId: string;
  estruturaFisicaId: string;
  coordenadas: CoordinateRange[];
  capacidade?: {
    unitizador?: string;
    peso?: number;
    altura?: number;
    largura?: number;
    comprimento?: number;
  };
}

export interface AddressWizardState {
  step: number;
  depositoId: string;
  estruturaFisicaId: string;
  estruturaFisicaNome: string;
  coordenadas: CoordinateRange[];
  capacidade?: {
    unitizador?: string;
    peso?: number;
    altura?: number;
    largura?: number;
    comprimento?: number;
  };
}

export interface AddressPreview {
  enderecoCompleto: string;
  enderecoAbreviado: string;
  alcance: 'ACESSÍVEL A MÃO' | 'NÃO ACESSÍVEL A MÃO';
}

export interface CreateAddressResponse {
  total: number;
  enderecos: AddressPreview[];
}