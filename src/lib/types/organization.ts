export interface Organization {
  id: string;
  codigo: string;
  nome: string;
  cnpj?: string;
  ativo: boolean;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export type UpsertOrganizationInput = {
  codigo: string;
  nome: string;
  cnpj?: string;
  ativo?: boolean;
  timezone?: string;
  createPrincipalDeposit?: boolean;
};
