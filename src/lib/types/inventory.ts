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
