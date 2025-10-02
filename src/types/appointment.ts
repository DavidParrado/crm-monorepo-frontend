export interface Appointment {
  id: number;
  clientId: number;
  clientName?: string;
  title: string;
  description?: string;
  appointmentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  clientId: number;
  title: string;
  description?: string;
  appointmentDate: string;
}

export interface UpdateAppointmentData {
  title?: string;
  description?: string;
  appointmentDate?: string;
}
