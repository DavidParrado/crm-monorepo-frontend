import { http } from "@/lib/http";
import { Appointment, CreateAppointmentData, UpdateAppointmentData } from "@/types/appointment";
import { PaginatedResponse } from "@/types/api";

export const getAppointments = (
  params: URLSearchParams
): Promise<PaginatedResponse<Appointment>> => {
  return http.get<PaginatedResponse<Appointment>>("appointments", params);
};

export const getAppointmentById = (id: string): Promise<Appointment> => {
  return http.get<Appointment>(`appointments/${id}`);
};

export const createAppointment = (
  data: CreateAppointmentData
): Promise<Appointment> => {
  return http.post<Appointment, CreateAppointmentData>("appointments", data);
};

export const updateAppointment = (
  id: number,
  data: UpdateAppointmentData
): Promise<Appointment> => {
  return http.patch<Appointment, UpdateAppointmentData>(`appointments/${id}`, data);
};

export const deleteAppointment = (id: number): Promise<void> => {
  return http.del<void>(`appointments/${id}`);
};
