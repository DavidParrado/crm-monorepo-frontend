import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types/user";
import { PaginatedResponse } from "@/types/api";

const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Ocurrió un error en la solicitud");
  }
  
  return response.json();
};

export const getUsers = (
  params?: URLSearchParams
): Promise<PaginatedResponse<User>> => {
  const queryString = params ? `?${params}` : "?limit=1000";
  return fetch(`${API_URL}/users${queryString}`, {
    headers: getAuthHeader(),
  }).then(handleResponse);
};
