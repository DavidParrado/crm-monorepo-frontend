import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { DashboardMetric } from "@/types/metric";
import { getDashboardStats } from "@/services/clientService";
import { toast } from "sonner";

export function useDashboardStats() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<DashboardMetric[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;

      setIsLoadingStats(true);
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Error al cargar las estadísticas");
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [token]);

  return { stats, isLoadingStats };
}
