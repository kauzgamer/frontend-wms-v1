export type StockAttribute = {
  id: string
  descricao: string
  formato: 'TEXTO' | 'DATA'
  origem: 'PADRÃO' | 'INCLUSÃO MANUAL'
  situacao: 'ATIVO' | 'INATIVO'
  createdAt?: string
  updatedAt?: string
}
