export type ProductCategory = {
  id: string
  descricao: string
  situacao: 'ATIVO' | 'INATIVO'
  createdAt?: string
  updatedAt?: string
}

export type ProductCategoryCreateInput = {
  descricao: string
  ativo?: boolean
}

export type ProductCategoryUpdateInput = Partial<{
  descricao: string
  ativo: boolean
}>
