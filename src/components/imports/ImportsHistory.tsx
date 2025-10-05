import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Info, AlertCircle } from "lucide-react";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { Import } from "@/types/import";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const ImportsHistory = () => {
  const [imports, setImports] = useState<Import[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
              <TableHead className="text-center">Detalles</TableHead>
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
                <TableCell className="text-center">
                  {(importItem.failedRecords > 0 || importItem.errors) && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Info className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Detalles de Importación</DialogTitle>
                          <DialogDescription>
                            {importItem.fileName} - {format(new Date(importItem.importedAt), "dd/MM/yyyy HH:mm", { locale: es })}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Total de registros</p>
                              <p className="text-2xl font-bold">{importItem.totalRows || (importItem.successfulRecords + importItem.failedRecords)}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Exitosos</p>
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{importItem.successfulRecords}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Fallidos</p>
                              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{importItem.failedRecords}</p>
                            </div>
                          </div>
                          
                          {importItem.errors && importItem.errors.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-semibold flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-destructive" />
                                Errores Encontrados
                              </h4>
                              <div className="space-y-2">
                                {importItem.errors.map((error, index) => (
                                  <Alert key={index} variant="destructive">
                                    <AlertDescription>
                                      <div className="space-y-1">
                                        <p className="font-medium">Fila {error.row} - Campo: {error.field}</p>
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                          {error.messages.map((message, msgIndex) => (
                                            <li key={msgIndex}>{message}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </AlertDescription>
                                  </Alert>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
