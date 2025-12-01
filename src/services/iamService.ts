import { SuperAdminLoginResponse } from "@/types/tenant";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export interface SuperAdminCredentials {
  username: string;
  password: string;
}

/**
 * Super Admin login via IAM endpoint.
 * This is separate from the regular auth flow.
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
export const getProfile = async (token: string): Promise<SuperAdminLoginResponse['user']> => {
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
