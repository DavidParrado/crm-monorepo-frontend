import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportStatusResponse } from "@/types/import";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface ImportResultFeedbackProps {
  result: ImportStatusResponse;
  onClose: () => void;
}

export const ImportResultFeedback = ({ result, onClose }: ImportResultFeedbackProps) => {
  const successCount = result.successfulRecords ?? 0;
  const failedCount = result.failedRecords ?? 0;
  const hasErrors = failedCount > 0;
  const hasSuccesses = successCount > 0;
  const isFailed = result.status === 'Failed';

  const getStatusMessage = () => {
    if (isFailed) return "La importación falló debido a un error crítico";
    if (hasErrors && hasSuccesses) return "Importación completada con algunos errores";
    if (hasErrors && !hasSuccesses) return "Todos los registros fallaron";
    return "Importación completada exitosamente";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isFailed || (!hasSuccesses && hasErrors) ? (
              <XCircle className="h-5 w-5 text-destructive" />
            ) : hasSuccesses && !hasErrors ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            )}
            Resultado de la Importación
          </CardTitle>
          <CardDescription>{getStatusMessage()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Registros Exitosos</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {successCount.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Registros Fallidos</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {failedCount.toLocaleString()}
              </p>
            </div>
          </div>

          {hasErrors && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Los registros fallidos pueden incluir duplicados o errores de validación.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onClose}>Nueva Importación</Button>
      </div>
    </div>
  );
};
