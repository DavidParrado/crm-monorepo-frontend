import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { Appointment, CreateAppointmentData, UpdateAppointmentData } from "@/types/appointment";
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
  
  if (response.status === 204) {
    return;
  }

  return response.json();
};

export const getAppointments = (
  params: URLSearchParams
): Promise<PaginatedResponse<Appointment>> => {
  return fetch(`${API_URL}/appointments?${params}`, {
    headers: getAuthHeader(),
  }).then(handleResponse);
};

export const createAppointment = (
  data: CreateAppointmentData
): Promise<Appointment> => {
  return fetch(`${API_URL}/appointments`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  }).then(handleResponse);
};

export const updateAppointment = (
  id: number,
  data: UpdateAppointmentData
): Promise<Appointment> => {
  return fetch(`${API_URL}/appointments/${id}`, {
    method: "PATCH",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  }).then(handleResponse);
};

export const deleteAppointment = (id: number): Promise<void> => {
  return fetch(`${API_URL}/appointments/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  }).then(handleResponse);
};

export const getAppointmentById = (id: string): Promise<Appointment> => {
  return fetch(`${API_URL}/appointments/${id}`, {
    headers: getAuthHeader(),
  }).then(handleResponse);
};
