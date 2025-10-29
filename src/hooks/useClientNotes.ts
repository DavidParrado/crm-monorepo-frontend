import { useState, useEffect, useCallback } from "react";
import { getNotesForClient } from "@/services/noteService";
import { Note } from "@/types/notes";
import { toast } from "sonner";

export const useClientNotes = (clientId: number | undefined) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchNotes = useCallback(async () => {
    if (!clientId) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const data = await getNotesForClient(clientId, params);
      setNotes(data.data);
      setTotalPages(Math.ceil(data.total / limit));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cargar las notas");
    } finally {
      setIsLoading(false);
    }
  }, [clientId, page]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    isLoading,
    page,
    totalPages,
    setPage,
    refetchNotes: fetchNotes,
  };
};
