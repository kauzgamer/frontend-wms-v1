export type Supplier = {
  id: string
  documento: string // CNPJ
  nome: string
  uf: string
  inscricaoEstadual?: string
  situacao: 'ATIVO' | 'INATIVO'
  createdAt?: string
  updatedAt?: string
}

export type SupplierCreateInput = {
  cnpj: string
  name: string
  uf: string
  stateRegistration?: string
  active?: boolean
}

export type SupplierUpdateInput = Partial<{
  cnpj: string
  name: string
  uf: string
  stateRegistration: string
  active: boolean
}>
