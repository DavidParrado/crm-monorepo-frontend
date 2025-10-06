import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { Import } from "@/types/import";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const ImportsHistory = () => {
  const [imports, setImports] = useState<Import[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedImport, setSelectedImport] = useState<Import | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchImports();
  }, []);

  const fetchImports = async () => {
    try {
      const response = await fetch(`${API_URL}/imports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar el historial');
      }

      const data = await response.json();
      setImports(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de importaciones",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (importItem: Import) => {
    setSelectedImport(importItem);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedImport) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/imports/${selectedImport.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la importación');
      }

      toast({
        title: "Importación eliminada",
        description: "Los registros de esta importación han sido eliminados exitosamente",
      });

      // Refresh the list
      fetchImports();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la importación",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedImport(null);
    }
  };

  const getStatusBadge = (status: Import['status']) => {
    const variants: Record<Import['status'], { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      Processing: { variant: "default", label: "Procesando" },
      Completed: { variant: "outline", label: "Completado" },
      'Completed with errors': { variant: "secondary", label: "Completado con errores" },
      Failed: { variant: "destructive", label: "Fallido" }
    };

    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (imports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Importaciones</CardTitle>
          <CardDescription>No hay importaciones registradas</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Importaciones</CardTitle>
        <CardDescription>
          Registro de todas las importaciones realizadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Archivo</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Exitosos</TableHead>
              <TableHead className="text-right">Fallidos</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {imports.map((importItem) => (
              <TableRow key={importItem.id}>
                <TableCell className="font-medium">{importItem.fileName}</TableCell>
                <TableCell>{importItem.user?.username || '-'}</TableCell>
                <TableCell>{getStatusBadge(importItem.status)}</TableCell>
                <TableCell className="text-right">{importItem.totalRows || (importItem.successfulRecords + importItem.failedRecords)}</TableCell>
                <TableCell className="text-right text-green-600 dark:text-green-400">
                  {importItem.successfulRecords}
                </TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">
                  {importItem.failedRecords}
                </TableCell>
                <TableCell>
                  {format(new Date(importItem.importedAt), "dd/MM/yyyy HH:mm", { locale: es })}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(importItem)}
                    title="Eliminar importación"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar importación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará todos los clientes importados en el lote "{selectedImport?.fileName}".
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
