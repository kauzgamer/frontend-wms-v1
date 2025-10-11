export type InventoryStatus = 'PENDENTE' | 'AGUARDANDO_CONTAGEM' | 'EM_ANDAMENTO' | 'FINALIZADO'

export interface InventorySummary {
  id: string
  identificador: string
  descricao: string
  criadoEm: string
  status: InventoryStatus
  progresso: number // 0..100
}

export interface InventoryDashboard {
  pendentes: number
  aguardandoContagem: number
  emAndamento: number
  finalizados: number
  atualizadoEm: string
}

export interface ListInventoriesParams {
  page?: number
  limit?: number
  search?: string
  status?: InventoryStatus | 'TODOS'
}

export interface ListInventoriesResponse {
  data: InventorySummary[]
  meta: {
    page: number
    limit: number
    total: number
  }
}

// Entrada para criação de inventário (alinhado ao backend)
export interface CreateInventoryInput {
  identificador?: string
  descricao: string
  tipo?: 'GERAL' | 'ENDERECO' | 'PRODUTO'
  escopo?: Array<{
    id: string
    depositoId: string
    estruturaFisicaId: string
    coordenadas: Array<{
      tipo: string
      nome: string
      abrev: string
      inicio: string | number
      fim: string | number
    }>
    situacao?: string
  }>
}

// Resultado da criação (backend retorna um resumo)
export type CreateInventoryResult = InventorySummary
