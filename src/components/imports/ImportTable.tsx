import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2, FileText, AlertCircle } from "lucide-react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/hooks/use-toast";
import type { Import } from "@/types/import";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ImportTableProps {
  imports: Import[];
  isLoading: boolean;
  onRefresh: () => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const statusMap = {
  pending: { label: "Pendiente", variant: "secondary" as const },
  processing: { label: "Procesando", variant: "default" as const },
  completed: { label: "Completado", variant: "default" as const },
  failed: { label: "Fallido", variant: "destructive" as const },
};

export function ImportTable({ imports, isLoading, onRefresh, page, totalPages, onPageChange }: ImportTableProps) {
  const { token } = useAuthStore();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`${API_URL}/imports/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al eliminar importación');

      toast({
        title: "Importación eliminada",
        description: "La importación se eliminó correctamente",
      });

      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la importación",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const showEllipsisStart = page > 3;
    const showEllipsisEnd = page < totalPages - 2;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, 5);
        if (showEllipsisEnd) pages.push(-1);
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        if (showEllipsisStart) pages.push(-1);
        pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1);
        if (showEllipsisStart) pages.push(-1);
        pages.push(page - 1, page, page + 1);
        if (showEllipsisEnd) pages.push(-2);
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Archivo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Procesados</TableHead>
            <TableHead>Errores</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {imports.map((importItem) => (
            <TableRow key={importItem.id}>
              <TableCell className="font-medium">{importItem.filename}</TableCell>
              <TableCell>
                <Badge variant={statusMap[importItem.status].variant}>
                  {statusMap[importItem.status].label}
                </Badge>
              </TableCell>
              <TableCell>{importItem.totalRows}</TableCell>
              <TableCell>{importItem.processedRows}</TableCell>
              <TableCell>
                {importItem.errorRows > 0 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setErrorDetails(importItem.errorDetails || "Sin detalles")}
                  >
                    <AlertCircle className="mr-1 h-4 w-4 text-destructive" />
                    {importItem.errorRows}
                  </Button>
                ) : (
                  importItem.errorRows
                )}
              </TableCell>
              <TableCell>
                {format(new Date(importItem.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(importItem.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => page > 1 && onPageChange(page - 1)}
                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {renderPagination().map((pageNum, idx) => (
              <PaginationItem key={idx}>
                {pageNum === -1 || pageNum === -2 ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => onPageChange(pageNum)}
                    isActive={pageNum === page}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => page < totalPages && onPageChange(page + 1)}
                className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar importación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los clientes importados no serán eliminados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={errorDetails !== null} onOpenChange={() => setErrorDetails(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Detalles de errores</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-wrap">
              {errorDetails}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDetails(null)}>Cerrar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
