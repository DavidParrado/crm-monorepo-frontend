import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Appointment, CreateAppointmentData, UpdateAppointmentData } from "@/types/appointment";
import { createAppointment, updateAppointment } from "@/services/appointmentService";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { RoleEnum } from "@/types/role";

interface UseAppointmentFormProps {
  appointment?: Appointment;
  onSuccess: () => void;
  open: boolean;
}

export function useAppointmentForm({ appointment, onSuccess, open }: UseAppointmentFormProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    title: "",
    description: "",
    date: "",
    time: ""
  });

  const isAdmin = user?.role?.name === RoleEnum.Admin;

  useEffect(() => {
    if (open) {
      if (appointment) {
        const localDate = new Date(appointment.appointmentDate);
        setFormData({
          userId: appointment.userId?.toString(),
          title: appointment.title,
          description: appointment.description || "",
          date: format(localDate, "yyyy-MM-dd"),
          time: format(localDate, "HH:mm"),
        });
      } else {
        setFormData({
          userId: "",
          title: "",
          description: "",
          date: "",
          time: "",
        });
      }
    }
  }, [open, appointment]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.time) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    if (isAdmin && !appointment && !formData.userId) {
      toast({
        title: "Error",
        description: "Por favor selecciona un usuario",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const localDateTime = new Date(`${formData.date}T${formData.time}`);
      const appointmentDate = localDateTime.toISOString();

      const body: CreateAppointmentData | UpdateAppointmentData = {
        ...(isAdmin && formData.userId ? { userId: parseInt(formData.userId) } : {}),
        title: formData.title,
        description: formData.description || undefined,
        appointmentDate,
      };

      if (appointment) {
        await updateAppointment(appointment.id, body);
        toast({
          title: "Éxito",
          description: "Cita actualizada correctamente",
        });
      } else {
        await createAppointment(body as CreateAppointmentData);
        toast({
          title: "Éxito",
          description: "Cita creada correctamente",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la cita",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    handleSubmit,
    isAdmin,
  };
}
