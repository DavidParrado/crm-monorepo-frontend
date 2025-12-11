// Enums
export enum IntegrationStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  PROVISIONING = 'PROVISIONING',
}

// Entities (Matching Backend TypeORM Entities)
export interface ChatwootAccount {
  id: string; // UUID
  accountId: number; // Numeric ID from Chatwoot
  name: string;
  dashboardUrl: string;
  adminUserId: number;
  userApiKey: string;
  createdAt: string; // ISO Date
  tenant?: { id: string; name: string; subdomain: string }; // Optional (Link to Tenant)
}

export interface EvolutionInstance {
  id: string; // UUID
  instanceName: string; // Slug (e.g. "ventas-principal")
  status: IntegrationStatus;
  apikey: string;
  createdAt: string; // ISO Date
  chatwootAccount?: ChatwootAccount;
}

// DTOs (Payloads for mutations)
export interface ProvisionChatwootDto {
  tenantId: string; // Required for linked accounts
  accountName: string;
  adminName: string;
  adminEmail: string;
  password?: string;
}

export interface CreateEvolutionInstanceDto {
  chatwootAccountId: string; // UUID of the Chatwoot Account (Local DB)
  instanceName: string; // Raw name (e.g., "Ventas Principal")
  organization?: string;
}

// API Responses
export interface ProvisionChatwootResponse {
  success: boolean;
  accountId: number;
  userId: number;
}

export interface ProvisionEvolutionResponse {
  success: boolean;
  instanceName: string;
  status: string;
}
