import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { ImportPreview, AVAILABLE_FIELDS, ImportUploadResponse } from "@/types/import";
import { useColumnMapper } from "@/hooks/useColumnMapper";

interface ColumnMapperProps {
  preview: ImportPreview;
  file: File;
  onCancel: () => void;
  onSuccess: (result: ImportUploadResponse) => void;
}

export const ColumnMapper = ({ preview, file, onCancel, onSuccess }: ColumnMapperProps) => {
  const { mapping, isSubmitting, handleMappingChange, handleSubmit } = useColumnMapper({
    file,
    onSuccess,
  });

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
          <ArrowLeft className="h-4 w-4 mr-2" />
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
