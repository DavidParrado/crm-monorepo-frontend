import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { FilterOptions } from "@/types/filters";
import { getFilterOptions } from "@/services/clientService";
import { toast } from "sonner";

export function useClientFilters() {
  const { token } = useAuthStore();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});

  useEffect(() => {
    const fetchFilterOptions = async () => {
      if (!token) return;

      try {
        const data = await getFilterOptions();
        setFilterOptions(data);
      } catch (error) {
        console.error("Error fetching filter options:", error);
        toast.error("Error al cargar las opciones de filtro");
      }
    };

    fetchFilterOptions();
  }, [token]);

  return { filterOptions };
}
