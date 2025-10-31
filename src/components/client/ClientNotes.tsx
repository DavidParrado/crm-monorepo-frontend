import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Note } from "@/types/notes";
import { AppPagination } from "@/components/ui/app-pagination";

interface ClientNotesProps {
  notes: Note[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ClientNotes({ notes, isLoading, page, totalPages, onPageChange }: ClientNotesProps) {

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
                    {note.user.firstName} {note.user?.lastName}
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
              <div className="mt-6">
                <AppPagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
