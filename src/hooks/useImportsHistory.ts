import { useState, useEffect, useCallback } from "react";
import { getHistory, deleteImport } from "@/services/importService";
import { Import } from "@/types/import";
import { toast } from "sonner";

export const useImportsHistory = () => {
  const [imports, setImports] = useState<Import[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchImports = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getHistory();
      setImports(data);
    } catch (error) {
      toast.error("No se pudo cargar el historial de importaciones");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImports();
  }, [fetchImports]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteImport(id);
      toast.success("Importación eliminada exitosamente");
      await fetchImports();
    } catch (error) {
      toast.error("No se pudo eliminar la importación");
      throw error;
    }
  }, [fetchImports]);

  return {
    imports,
    isLoading,
    handleDelete,
    refetchHistory: fetchImports,
  };
};
