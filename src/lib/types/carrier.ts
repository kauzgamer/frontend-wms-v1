export type Carrier = {
  id: string
  documento: string // CNPJ/CPF
  nome: string
  uf: string
  inscricaoEstadual?: string
  situacao: 'ATIVO' | 'INATIVO'
  createdAt?: string
  updatedAt?: string
}

export type CarrierCreateInput = {
  cnpj?: string
  cpf?: string
  name: string
  uf: string
  stateRegistration?: string
  active?: boolean
}

export type CarrierUpdateInput = Partial<{
  cnpj: string
  cpf: string
  name: string
  uf: string
  stateRegistration: string
  active: boolean
}>
