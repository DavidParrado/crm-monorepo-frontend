import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAppointmentById } from "@/services/appointmentService";
import { Appointment } from "@/types/appointment";
import { useToast } from "@/hooks/use-toast";

export const useAppointmentDetail = (id: string | undefined) => {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchAppointment = useCallback(async () => {
    if (!id) {
      navigate("/calendar");
      return;
    }

    setLoading(true);
    try {
      const data = await getAppointmentById(id);
      setAppointment(data);
    } catch (error) {
      console.error("Error loading appointment:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la cita",
        variant: "destructive",
      });
      navigate("/calendar");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  return { appointment, loading, refetchAppointment: fetchAppointment };
};
