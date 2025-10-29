import { http } from "@/lib/http";
import { User } from "@/types/user";
import { PaginatedResponse } from "@/types/api";

export const getUsers = (
  params?: URLSearchParams
): Promise<PaginatedResponse<User>> => {
  const queryParams = params || new URLSearchParams({ limit: "1000" });
  return http.get<PaginatedResponse<User>>("users", queryParams);
};
