// Client Service - Centralized API logic for client management
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { Client } from "@/types/client";
import { DashboardMetric } from "@/types/metric";
import { PaginatedResponse } from "@/types/api";
import { FilterOptions } from "@/types/filters";

// Helper function to get authorization headers
const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Generic response handler with error management
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Ocurrió un error en la solicitud",
    }));
    throw new Error(error.message || "Ocurrió un error en la solicitud");
  }

  // Handle No Content responses (like DELETE)
  if (response.status === 204) {
    return undefined as T;
  }

  // Handle blob responses (for exports)
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
    return response.blob() as T;
  }

  return response.json();
};

// --- Dashboard Stats ---

export const getDashboardStats = async (): Promise<DashboardMetric[]> => {
  const response = await fetch(`${API_URL}/dashboard/stats`, {
    headers: getAuthHeader(),
  });
  return handleResponse<DashboardMetric[]>(response);
};

// --- Filter Options ---

export const getFilterOptions = async (): Promise<FilterOptions> => {
  const response = await fetch(`${API_URL}/clients/filter-options`, {
    headers: getAuthHeader(),
  });
  return handleResponse<FilterOptions>(response);
};

// --- Client CRUD Operations ---

export const getClients = async (
  params: URLSearchParams
): Promise<PaginatedResponse<Client>> => {
  const response = await fetch(`${API_URL}/clients?${params}`, {
    headers: getAuthHeader(),
  });
  return handleResponse<PaginatedResponse<Client>>(response);
};

export const deleteClient = async (clientId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/clients/${clientId}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  return handleResponse<void>(response);
};

// --- Bulk Operations ---

export const bulkAssignClients = async (
  clientIds: number[],
  assigneeUserId: number
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/clients/assign-bulk`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ clientIds, assigneeUserId }),
  });
  return handleResponse<{ message: string }>(response);
};

export const bulkUnassignClients = async (
  clientIds: number[]
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/clients/unassign-bulk`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ clientIds }),
  });
  return handleResponse<{ message: string }>(response);
};

export const bulkDeleteClients = async (
  clientIds: number[]
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/clients/delete-bulk`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ clientIds }),
  });
  return handleResponse<{ message: string }>(response);
};

export const exportClients = async (clientIds: number[]): Promise<Blob> => {
  const response = await fetch(`${API_URL}/clients/export`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ clientIds }),
  });
  return handleResponse<Blob>(response);
};
