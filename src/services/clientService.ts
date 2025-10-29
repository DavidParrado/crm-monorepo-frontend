import { http } from "@/lib/http";
import { Client } from "@/types/client";
import { DashboardMetric } from "@/types/metric";
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
