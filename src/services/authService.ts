import { http } from "@/lib/http";
import { User } from "@/types/user";

// Get the API_URL, but only for the unauthenticated login call
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Login response interface
 */
export interface LoginResponse {
  access_token: string;
  user: User;
}

/**
 * Logs in a user.
 * This is the ONLY service function that uses fetch() directly,
 * as it's unauthenticated and is the source of the auth token.
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al iniciar sesión');
  }

  return response.json();
};

/**
 * Gets the profile for the currently authenticated user.
 * This uses our standard http adapter.
 */
export const getProfile = (): Promise<User> => {
  return http.get<User>("auth/profile");
};
