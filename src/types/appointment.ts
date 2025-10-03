export interface Appointment {
  id: number;
  userId: number;
  userName?: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  userId: number;
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
