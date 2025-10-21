export interface OdbcConnectionConfig {
  dsn: string;
  uid: string;
  pwd: string;
  host: string;
  port?: number | null;
  database: string;
}

export interface OdbcIntegrationConfig {
  id: string;
  name: string;
  description?: string | null;
  query: string;
  connection: OdbcConnectionConfig;
  organizationId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertOdbcIntegrationConfigInput {
  name: string;
  description?: string | null;
  query: string;
  connection: OdbcConnectionConfig;
  organizationId?: string | null;
}

export interface TestOdbcConnectionPayload {
  connection?: OdbcConnectionConfig;
  configId?: string;
  query?: string;
  limit?: number;
}

export interface OdbcTestResponse {
  success: boolean;
  message?: string;
  details?: string[];
}

export interface OdbcSyncRequest {
  configId: string;
  limit?: number;
  offset?: number;
}

export interface OdbcSyncResult {
  synced: number;
  errors: string[];
  details: string[];
}

export interface OdbcImportResponse {
  batchId: string;
  totalRecords: number;
  message: string;
}