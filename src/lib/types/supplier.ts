export type Supplier = {
  id: string
  documento: string // CNPJ/CPF
  nome: string
  uf: string
  inscricaoEstadual?: string
  situacao: 'ATIVO' | 'INATIVO'
  createdAt?: string
  updatedAt?: string
}

export type SupplierCreateInput = {
  cnpj?: string
  cpf?: string
  name: string
  uf?: string
  stateRegistration?: string
  active?: boolean
}

export type SupplierUpdateInput = Partial<{
  cnpj: string
  cpf: string
  name: string
  uf: string
  stateRegistration: string
  active: boolean
}>
