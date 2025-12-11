import { http } from '@/lib/http';
import {
  ChatwootAccount,
  EvolutionInstance,
  ProvisionChatwootDto,
  CreateEvolutionInstanceDto,
  ProvisionChatwootResponse,
  ProvisionEvolutionResponse,
} from '@/types/integrations';
import { PaginatedResponse } from '@/types/api';

// Chatwoot Endpoints
export const getChatwootAccounts = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<ChatwootAccount>> => {
  const response = await http.get<PaginatedResponse<ChatwootAccount>>(
    `/integrations/chatwoot?page=${page}&limit=${limit}`
  );
  return response;
};

export const getChatwootByTenant = async (
  tenantId: string
): Promise<ChatwootAccount | null> => {
  try {
    const response = await http.get<ChatwootAccount>(
      `/integrations/chatwoot/tenant/${tenantId}`
    );
    return response;
  } catch (error) {
    // Return null if not found (404)
    return null;
  }
};

export const provisionChatwoot = async (
  data: ProvisionChatwootDto
): Promise<ProvisionChatwootResponse> => {
  const response = await http.post<ProvisionChatwootResponse>(
    '/integrations/chatwoot/provision',
    data
  );
  return response;
};

export const deprovisionChatwoot = async (tenantId: string): Promise<void> => {
  await http.del(`/integrations/chatwoot/deprovision/${tenantId}`);
};

export const deleteChatwootAccount = async (id: string): Promise<void> => {
  await http.del(`/integrations/chatwoot/${id}`);
};

// Evolution API Endpoints
export const getEvolutionInstances = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<EvolutionInstance>> => {
  const response = await http.get<PaginatedResponse<EvolutionInstance>>(
    `/integrations/evolution?page=${page}&limit=${limit}`
  );
  return response;
};

export const getEvolutionByAccount = async (
  chatwootAccountId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<EvolutionInstance>> => {
  const response = await http.get<PaginatedResponse<EvolutionInstance>>(
    `/integrations/evolution/account/${chatwootAccountId}?page=${page}&limit=${limit}`
  );
  return response;
};

export const provisionEvolution = async (
  data: CreateEvolutionInstanceDto
): Promise<ProvisionEvolutionResponse> => {
  const response = await http.post<ProvisionEvolutionResponse>(
    '/integrations/evolution/provision',
    data
  );
  return response;
};

export const deleteEvolutionInstance = async (
  instanceName: string
): Promise<void> => {
  await http.del(`/integrations/evolution/instance/${instanceName}`);
};

export const integrationsService = {
  getChatwootAccounts,
  getChatwootByTenant,
  provisionChatwoot,
  deprovisionChatwoot,
  deleteChatwootAccount,
  getEvolutionInstances,
  getEvolutionByAccount,
  provisionEvolution,
  deleteEvolutionInstance,
};
