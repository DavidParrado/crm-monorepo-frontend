import { Tenant, CreateTenantData, UpdateTenantData, TenantFilters } from "@/types/tenant";
import { useAuthStore } from "@/store/authStore";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

/**
 * Gets the Super Admin auth header.
 * Does NOT include x-tenant-id for global endpoints.
 */
const getSuperAdminHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Handles API response.
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error en la solicitud' }));
    throw new Error(error.message || 'Error en la solicitud');
  }
  
  if (response.status === 204) {
    return undefined as T;
  }
  
  return response.json();
};

/**
 * Get all tenants with optional filters.
 */
export const getAll = async (filters?: TenantFilters): Promise<Tenant[]> => {
  const params = new URLSearchParams();
  if (filters?.trashed !== undefined) {
    params.append('trashed', String(filters.trashed));
  }
  
  const queryString = params.toString();
  const url = `${API_URL}/tenancy${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getSuperAdminHeaders(),
  });
  return handleResponse<Tenant[]>(response);
};

/**
 * Create a new tenant.
 */
export const create = async (data: CreateTenantData): Promise<Tenant> => {
  const response = await fetch(`${API_URL}/tenancy`, {
    method: 'POST',
    headers: getSuperAdminHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Tenant>(response);
};

/**
 * Update an existing tenant.
 */
export const update = async (id: string, data: UpdateTenantData): Promise<Tenant> => {
  const response = await fetch(`${API_URL}/tenancy/${id}`, {
    method: 'PATCH',
    headers: getSuperAdminHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Tenant>(response);
};

/**
 * Soft delete a tenant (moves to trash).
 */
export const remove = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/tenancy/${id}`, {
    method: 'DELETE',
    headers: getSuperAdminHeaders(),
  });
  return handleResponse<void>(response);
};

/**
 * Restore a soft-deleted tenant.
 */
export const restore = async (id: string): Promise<Tenant> => {
  const response = await fetch(`${API_URL}/tenancy/${id}/restore`, {
    method: 'PATCH',
    headers: getSuperAdminHeaders(),
  });
  return handleResponse<Tenant>(response);
};

/**
 * Permanently delete a tenant (hard delete).
 */
export const hardDelete = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/tenancy/${id}?hardDelete=true`, {
    method: 'DELETE',
    headers: getSuperAdminHeaders(),
  });
  return handleResponse<void>(response);
};

/**
 * Reset the admin password for a tenant.
 */
export const resetTenantPassword = async (id: string, password: string): Promise<void> => {
  const response = await fetch(`${API_URL}/tenancy/${id}/reset-admin-password`, {
    method: 'POST',
    headers: getSuperAdminHeaders(),
    body: JSON.stringify({ password }),
  });
  return handleResponse<void>(response);
};
