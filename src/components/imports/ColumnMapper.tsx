import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { ImportPreview, ImportMapping, AVAILABLE_FIELDS, ImportUploadResponse } from "@/types/import";

interface ColumnMapperProps {
  preview: ImportPreview;
  file: File;
  onCancel: () => void;
  onSuccess: (result: ImportUploadResponse) => void;
}

export const ColumnMapper = ({ preview, file, onCancel, onSuccess }: ColumnMapperProps) => {
  const [mapping, setMapping] = useState<ImportMapping>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const token = useAuthStore((state) => state.token);

  const handleMappingChange = (columnIndex: number, fieldName: string) => {
    setMapping(prev => ({
      ...prev,
      [columnIndex]: fieldName
    }));
  };

  const handleSubmit = async () => {
    // Validar que al menos un campo esté mapeado (no ignore)
    const hasMapping = Object.values(mapping).some(field => field !== 'ignore');
    if (!hasMapping) {
      toast({
        title: "Error",
        description: "Debes mapear al menos una columna",
        variant: "destructive",
      });
      return;
    }

    // Validar que email esté mapeado
    const hasEmail = Object.values(mapping).includes('email');
    if (!hasEmail) {
      toast({
        title: "Error",
        description: "Debes mapear la columna de Email",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mapping', JSON.stringify(mapping));

      const response = await fetch(`${API_URL}/imports/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al procesar la importación');
      }

      const result: ImportUploadResponse = await response.json();

      toast({
        title: "Importación completada",
        description: `${result.successful} registros exitosos, ${result.failed} fallidos`,
      });

      onSuccess(result);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la importación",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Mapeo de Columnas</h3>
          <p className="text-sm text-muted-foreground">
            Asigna cada columna del CSV a un campo del sistema
          </p>
        </div>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Columna CSV</TableHead>
              <TableHead>Ejemplo de Datos</TableHead>
              <TableHead>Mapear a Campo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.headers.map((header, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{header}</TableCell>
                <TableCell className="text-muted-foreground">
                  {preview.previewRows[0]?.[index] || '-'}
                </TableCell>
                <TableCell>
                  <Select
                    value={mapping[index] || 'ignore'}
                    onValueChange={(value) => handleMappingChange(index, value)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Seleccionar campo" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_FIELDS.map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Nota:</strong> El campo Email es obligatorio para procesar la importación.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirmar Importación
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
