import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Appointment } from "@/types/appointment";
import { getAppointments } from "@/services/appointmentService";
import { useToast } from "@/hooks/use-toast";

export function useAppointments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "12", 10);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const data = await getAppointments(params);
      setAppointments(data?.data || []);
      setTotal(data?.total || 0);
      setTotalPages(Math.ceil((data?.total || 0) / limit));
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las citas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, limit]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString(), limit: limit.toString() });
  };

  const refetchAppointments = () => {
    fetchAppointments();
  };

  return {
    appointments,
    loading,
    totalPages,
    total,
    page,
    limit,
    handlePageChange,
    refetchAppointments,
  };
}
