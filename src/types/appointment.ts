export interface Appointment {
  id: number;
  clientId: number;
  clientName?: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  clientId?: number;
  title: string;
  description?: string;
  date: string;
  time: string;
}

export interface UpdateAppointmentData {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
}
