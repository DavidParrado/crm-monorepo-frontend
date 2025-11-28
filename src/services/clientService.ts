import { http } from "@/lib/http";
import { Client } from "@/types/client";
import { DashboardMetric, CreateMetricDto, UpdateMetricDto } from "@/types/metric";
import { PaginatedResponse } from "@/types/api";
import { FilterOptions } from "@/types/filters";

// --- Dashboard Stats ---

export const getDashboardStats = async (): Promise<DashboardMetric[]> => {
  return http.get<DashboardMetric[]>("dashboard/stats");
};

// --- Filter Options ---

export const getFilterOptions = async (): Promise<FilterOptions> => {
  return http.get<FilterOptions>("clients/filter-options");
};

// --- Client CRUD Operations ---

export const getClients = async (
  params: URLSearchParams
): Promise<PaginatedResponse<Client>> => {
  return http.get<PaginatedResponse<Client>>("clients", params);
};

export const deleteClient = async (clientId: number): Promise<void> => {
  return http.del<void>(`clients/${clientId}`);
};

// --- Bulk Operations ---

export const bulkAssignClients = async (
  clientIds: number[],
  assigneeUserId: number
): Promise<{ message: string }> => {
  return http.post<{ message: string }, { clientIds: number[]; assigneeUserId: number }>(
    "clients/assign-bulk",
    { clientIds, assigneeUserId }
  );
};

export const bulkUnassignClients = async (
  clientIds: number[]
): Promise<{ message: string }> => {
  return http.post<{ message: string }, { clientIds: number[] }>(
    "clients/unassign-bulk",
    { clientIds }
  );
};

export const bulkDeleteClients = async (
  clientIds: number[]
): Promise<{ message: string }> => {
  return http.post<{ message: string }, { clientIds: number[] }>(
    "clients/delete-bulk",
    { clientIds }
  );
};

export const exportClients = async (clientIds: number[]): Promise<Blob> => {
  return http.postBlob<{ clientIds: number[] }>("clients/export", { clientIds });
};

// --- Single Client Operations ---

export const getClientById = (id: string): Promise<Client> => {
  return http.get<Client>(`clients/${id}`);
};

// --- Conversion Operations ---

export const proposeConversion = (id: number): Promise<Client> => {
  return http.post<Client, {}>(`clients/${id}/propose-conversion`, {});
};

export const confirmConversion = (id: number): Promise<Client> => {
  return http.post<Client, {}>(`clients/${id}/confirm-conversion`, {});
};

export const rejectConversion = (id: number): Promise<Client> => {
  return http.post<Client, {}>(`clients/${id}/reject-conversion`, {});
};

export const cancelProposal = (id: number): Promise<Client> => {
  return http.post<Client, {}>(`clients/${id}/cancel-proposal`, {});
};

// --- Metrics ---

export const getMetrics = (): Promise<DashboardMetric[]> => {
  return http.get<DashboardMetric[]>("dashboard/metrics");
};

export const createMetric = (data: CreateMetricDto): Promise<DashboardMetric> => {
  return http.post<DashboardMetric, CreateMetricDto>("dashboard/metrics", data);
};

export const updateMetric = (id: number, data: UpdateMetricDto): Promise<DashboardMetric> => {
  return http.patch<DashboardMetric, UpdateMetricDto>(`dashboard/metrics/${id}`, data);
};

export const deleteMetric = (id: number): Promise<void> => {
  return http.del<void>(`dashboard/metrics/${id}`);
};
