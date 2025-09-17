export interface IntegrationTransaction {
  id: string
  date: string
  document: string
  key: string
  process: string
  status: 'success' | 'failed' | 'quarantine'
}

export async function fetchIntegrationTransactions(): Promise<IntegrationTransaction[]> {
  const response = await fetch('/api/integration/transactions');
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return response.json();
}
