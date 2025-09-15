import { nanoid } from 'nanoid'

export interface IntegrationTransaction {
  id: string
  date: string
  document: string
  key: string
  process: string
  status: 'success' | 'failed' | 'quarantine'
}

function randomStatus(i: number): IntegrationTransaction['status'] {
  if (i % 17 === 0) return 'quarantine'
  if (i % 9 === 0) return 'failed'
  return 'success'
}

export async function fetchIntegrationTransactions(count = 42, delay = 600): Promise<IntegrationTransaction[]> {
  await new Promise(r => setTimeout(r, delay))
  const today = new Date()
  today.setHours(0,0,0,0)
  return Array.from({ length: count }).map((_, i) => {
    const d = new Date(today)
    d.setMinutes(d.getMinutes() - i * 13)
    return {
      id: nanoid(10),
      date: d.toISOString(),
      document: `DOC-${(i+1).toString().padStart(4,'0')}`,
      key: `KEY-${(i+1).toString().padStart(6,'0')}`,
      process: ['Import','Export','Sync'][i % 3],
      status: randomStatus(i)
    }
  })
}
