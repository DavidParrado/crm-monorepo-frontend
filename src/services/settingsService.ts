import { http } from "@/lib/http";
import { Group } from "@/types/group";
import { Status } from "@/types/status";
import { Management } from "@/types/management";
import { Role } from "@/types/role";

// --- Groups ---
export const getGroups = (): Promise<Group[]> => {
  return http.get<Group[]>("groups");
};

export const createGroup = (data: { name: string }): Promise<Group> => {
  return http.post<Group, { name: string }>("groups", data);
};

export const updateGroup = (id: number, data: { name: string }): Promise<Group> => {
  return http.patch<Group, { name: string }>(`groups/${id}`, data);
};

export const deleteGroup = (id: number): Promise<void> => {
  return http.del<void>(`groups/${id}`);
};

// --- Statuses ---
export const getStatuses = (): Promise<Status[]> => {
  return http.get<Status[]>("client-statuses");
};

export const createStatus = (data: { name: string }): Promise<Status> => {
  return http.post<Status, { name: string }>("client-statuses", data);
};

export const updateStatus = (id: number, data: { name: string }): Promise<Status> => {
  return http.patch<Status, { name: string }>(`client-statuses/${id}`, data);
};

export const deleteStatus = (id: number): Promise<void> => {
  return http.del<void>(`client-statuses/${id}`);
};

// --- Managements ---
export const getManagements = (): Promise<Management[]> => {
  return http.get<Management[]>("managements");
};

export const createManagement = (data: { name: string; groupId: number | null }): Promise<Management> => {
  return http.post<Management, { name: string; groupId: number | null }>("managements", data);
};

export const updateManagement = (id: number, data: { name: string; groupId: number | null }): Promise<Management> => {
  return http.patch<Management, { name: string; groupId: number | null }>(`managements/${id}`, data);
};

export const deleteManagement = (id: number): Promise<void> => {
  return http.del<void>(`managements/${id}`);
};

// --- Roles ---
export const getRoles = (): Promise<Role[]> => {
  return http.get<Role[]>("roles");
};
