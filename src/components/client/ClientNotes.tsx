import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface Note {
  id: string;
  content: string;
  management: { id: number; name: string; };
  createdBy: { id: string; firstName: string; lastName: string; };
  createdAt: string;
}

interface NotesResponse {
  data: Note[];
  meta: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

interface ClientNotesProps {
  clientId: string;
  refresh: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export function ClientNotes({ clientId, refresh }: ClientNotesProps) {
  const { token } = useAuthStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (!clientId || !token) return;

    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/notes/client/${clientId}?page=${page}&limit=${limit}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Error al cargar las notas');
        }

        const data: NotesResponse = await response.json();
        setNotes(data.data);
        setTotalPages(data.meta.totalPages);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error al cargar las notas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [clientId, token, page, refresh]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Notas</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : notes.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay notas para este cliente
          </p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm">{note.content}</p>
                  </div>
                  <Badge variant="secondary">{note.management.name}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {note.createdBy.firstName} {note.createdBy.lastName}
                  </span>
                  <span>
                    {new Date(note.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
