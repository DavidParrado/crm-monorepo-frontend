import { NotificationType } from "./enums/notification.enum";

interface BaseNotification {
  id: number;
  isRead: boolean;
  link: string | null;
  createdAt: string;
  recipientId: number;
}

type AppointmentReminderNotification = BaseNotification & {
  type: NotificationType.APPOINTMENT_REMINDER;
  payload: {
    appointmentTitle: string;
    appointmentDate: string;
  };
};

type AppointmentCreatedNotification = BaseNotification & {
  type: NotificationType.APPOINTMENT_CREATED;
  payload: {
    assignerName: string;
    appointmentTitle: string;
    appointmentDate: string;
  };
};

type AppointmentRescheduledNotification = BaseNotification & {
  type: NotificationType.APPOINTMENT_RESCHEDULED;
  payload: {
    appointmentTitle: string;
    oldAppointmentDate: string;
    newAppointmentDate: string;
  };
};

type AppointmentUpdatedNotification = BaseNotification & {
  type: NotificationType.APPOINTMENT_UPDATED;
  payload: {
    appointmentTitle: string;
  };
};

type AppointmentCancelledNotification = BaseNotification & {
  type: NotificationType.APPOINTMENT_CANCELLED;
  payload: {
    appointmentTitle: string;
    appointmentDate: string;
  };
};

type ClientAssignedNotification = BaseNotification & {
  type: NotificationType.CLIENT_ASSIGNED;
  payload: {
    clientCount: number;
  };
};

type ClientConversionConfirmedNotification = BaseNotification & {
  type: NotificationType.CLIENT_CONVERSION_CONFIRMED;
  payload: {
    clientName: string;
  };
};

type ClientConversionRejectedNotification = BaseNotification & {
  type: NotificationType.CLIENT_CONVERSION_REJECTED;
  payload: {
    clientName: string;
  };
};

type ImportCompletedNotification = BaseNotification & {
  type: NotificationType.IMPORT_COMPLETED;
  payload: {
    importId: number;
    fileName: string;
    successfulCount: number;
    failedCount: number;
  };
};

export type AppNotification =
  | AppointmentReminderNotification
  | AppointmentCreatedNotification
  | AppointmentRescheduledNotification
  | AppointmentUpdatedNotification
  | AppointmentCancelledNotification
  | ClientAssignedNotification
  | ClientConversionConfirmedNotification
  | ClientConversionRejectedNotification
  | ImportCompletedNotification;

// Alias para compatibilidad
export type Notification = AppNotification;
