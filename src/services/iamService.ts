import { SuperAdminLoginResponse, SuperAdminUser, CreateTeamMemberData, UpdateTeamMemberData } from "@/types/tenant";
import { useAuthStore } from "@/store/authStore";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export interface SuperAdminCredentials {
  username: string;
  password: string;
}

/**
 * Gets the Super Admin auth header.
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
 * Super Admin login via IAM endpoint.
 */
export const login = async (credentials: SuperAdminCredentials): Promise<SuperAdminLoginResponse> => {
  const response = await fetch(`${API_URL}/iam/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al iniciar sesión como Super Admin');
  }

  return response.json();
};

/**
 * Get the Super Admin profile (validates token).
 */
export const getProfile = async (token: string): Promise<SuperAdminUser> => {
  const response = await fetch(`${API_URL}/iam/profile`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al validar la sesión de Super Admin');
  }

  return response.json();
};

/**
 * Get all team members (IAM users).
 */
export const getTeam = async (): Promise<SuperAdminUser[]> => {
  const response = await fetch(`${API_URL}/iam/users`, {
    method: 'GET',
    headers: getSuperAdminHeaders(),
  });
  return handleResponse<SuperAdminUser[]>(response);
};

/**
 * Invite a new team member.
 */
export const inviteMember = async (data: CreateTeamMemberData): Promise<SuperAdminUser> => {
  const response = await fetch(`${API_URL}/iam/users`, {
    method: 'POST',
    headers: getSuperAdminHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<SuperAdminUser>(response);
};

/**
 * Update a team member.
 */
export const updateMember = async (id: string, data: UpdateTeamMemberData): Promise<SuperAdminUser> => {
  const response = await fetch(`${API_URL}/iam/users/${id}`, {
    method: 'PATCH',
    headers: getSuperAdminHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<SuperAdminUser>(response);
};

/**
 * Remove a team member.
 */
export const removeMember = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/iam/users/${id}`, {
    method: 'DELETE',
    headers: getSuperAdminHeaders(),
  });
  return handleResponse<void>(response);
};
