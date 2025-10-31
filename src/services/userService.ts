import { http } from "@/lib/http";
import { User } from "@/types/user";
import { CreateUserData, UpdateUserData } from "@/types/user-dto";
import { PaginatedResponse } from "@/types/api";

export const getUsers = (params: URLSearchParams): Promise<PaginatedResponse<User>> => {
  return http.get<PaginatedResponse<User>>("users", params);
};

export const createUser = (data: CreateUserData): Promise<User> => {
  return http.post<User, CreateUserData>("users", data);
};

export const updateUser = (id: number, data: UpdateUserData): Promise<User> => {
  return http.patch<User, UpdateUserData>(`users/${id}`, data);
};

export const deleteUser = (id: number): Promise<void> => {
  return http.del<void>(`users/${id}`);
};

export const resetPassword = (id: number, newPassword: string): Promise<void> => {
  return http.post<void, { newPassword: string }>(`users/${id}/password`, { newPassword });
};
