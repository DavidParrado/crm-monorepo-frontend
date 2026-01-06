import { AppNotification } from "@/types/notification";
import { NotificationType } from "@/types/enums/notification.enum";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface FormattedNotification {
  title: string;
  description: string;
  icon: 'reminder' | 'info' | 'success' | 'warning';
}

const notificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.APPOINTMENT_CREATED]: 'Cita Creada',
  [NotificationType.APPOINTMENT_UPDATED]: 'Cita Actualizada',
  [NotificationType.APPOINTMENT_RESCHEDULED]: 'Cita Reprogramada',
  [NotificationType.APPOINTMENT_CANCELLED]: 'Cita Cancelada',
  [NotificationType.APPOINTMENT_REMINDER]: 'Recordatorio de Cita',
  [NotificationType.CLIENT_ASSIGNED]: 'Cliente Asignado',
  [NotificationType.CLIENT_CONVERSION_CONFIRMED]: 'Conversión Confirmada',
  [NotificationType.CLIENT_CONVERSION_REJECTED]: 'Conversión Rechazada',
  [NotificationType.IMPORT_COMPLETED]: 'Importación Completada',
};

export function getNotificationTypeLabel(type: NotificationType): string {
  return notificationTypeLabels[type] || 'Notificación';
}

export function formatNotification(notification: AppNotification): FormattedNotification {
  const { type, payload } = notification;

  switch (type) {
    case NotificationType.APPOINTMENT_REMINDER: {
      const time = new Date(payload.appointmentDate).toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const date = format(new Date(payload.appointmentDate), "PPP", { locale: es });
      return {
        title: 'Recordatorio de Cita',
        description: `Tu cita "${payload.appointmentTitle}" es a las ${time} (${date})`,
        icon: 'reminder',
      };
    }

    case NotificationType.APPOINTMENT_CREATED: {
      const date = format(new Date(payload.appointmentDate), "PPP 'a las' p", { locale: es });
      return {
        title: 'Nueva Cita Agendada',
        description: `${payload.assignerName} te ha agendado la cita "${payload.appointmentTitle}" para el ${date}`,
        icon: 'info',
      };
    }

    case NotificationType.APPOINTMENT_RESCHEDULED: {
      const oldDate = format(new Date(payload.oldAppointmentDate), "PPP 'a las' p", { locale: es });
      const newDate = format(new Date(payload.newAppointmentDate), "PPP 'a las' p", { locale: es });
      return {
        title: 'Cita Reprogramada',
        description: `Tu cita "${payload.appointmentTitle}" ha sido reprogramada de ${oldDate} a ${newDate}`,
        icon: 'warning',
      };
    }

    case NotificationType.APPOINTMENT_UPDATED: {
      return {
        title: 'Cita Actualizada',
        description: `Los detalles de tu cita "${payload.appointmentTitle}" han sido actualizados`,
        icon: 'info',
      };
    }

    case NotificationType.APPOINTMENT_CANCELLED: {
      const date = format(new Date(payload.appointmentDate), "PPP", { locale: es });
      return {
        title: 'Cita Cancelada',
        description: `Tu cita "${payload.appointmentTitle}" programada para el ${date} ha sido cancelada`,
        icon: 'warning',
      };
    }

    case NotificationType.CLIENT_ASSIGNED: {
      const clientText = payload.clientCount === 1 ? 'un nuevo cliente' : `${payload.clientCount} nuevos clientes`;
      return {
        title: 'Cliente(s) Asignado(s)',
        description: `Se te ha asignado ${clientText}`,
        icon: 'success',
      };
    }

    case NotificationType.CLIENT_CONVERSION_CONFIRMED: {
      return {
        title: 'Conversión Confirmada',
        description: `¡Felicidades! La conversión del cliente ${payload.clientName} ha sido confirmada`,
        icon: 'success',
      };
    }

    case NotificationType.CLIENT_CONVERSION_REJECTED: {
      return {
        title: 'Conversión Rechazada',
        description: `La propuesta de conversión del cliente ${payload.clientName} fue rechazada`,
        icon: 'warning',
      };
    }

    case NotificationType.IMPORT_COMPLETED: {
      const statusText = payload.failedCount > 0 
        ? `${payload.successfulCount?.toLocaleString()} exitosos, ${payload.failedCount?.toLocaleString()} fallidos`
        : `${payload.successfulCount?.toLocaleString()} registros importados`;
      return {
        title: 'Importación Finalizada',
        description: `"${payload.fileName}": ${statusText}`,
        icon: payload.failedCount > 0 ? 'warning' : 'success',
      };
    }

    default: {
      return {
        title: 'Nueva Notificación',
        description: 'Tienes una nueva notificación',
        icon: 'info',
      };
    }
  }
}
