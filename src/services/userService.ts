import { http } from "@/lib/http";
import { User } from "@/types/user";
import { PaginatedResponse } from "@/types/api";

export const getUsers = (params: URLSearchParams): Promise<PaginatedResponse<User>> => {
  return http.get<PaginatedResponse<User>>("users", params);
};
