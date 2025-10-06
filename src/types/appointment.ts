export interface Appointment {
  id: number;
  userId: number;
  userName?: string;
  title: string;
  description?: string;
  appointmentDate: string; // ISO 8601 UTC string
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  userId: number;
  title: string;
  description?: string;
  appointmentDate: string; // ISO 8601 UTC string
}

export interface UpdateAppointmentData {
  title?: string;
  description?: string;
  appointmentDate?: string; // ISO 8601 UTC string
}
