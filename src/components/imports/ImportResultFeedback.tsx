import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ImportUploadResponse } from "@/types/import";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface ImportResultFeedbackProps {
  result: ImportUploadResponse;
  onClose: () => void;
}

export const ImportResultFeedback = ({ result, onClose }: ImportResultFeedbackProps) => {
  const hasErrors = result.failed > 0;
  const hasSuccesses = result.successful > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {hasErrors && !hasSuccesses && (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            {hasSuccesses && !hasErrors && (
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            )}
            {hasSuccesses && hasErrors && (
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            )}
            Resultado de la Importación
          </CardTitle>
          <CardDescription>{result.message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Registros Exitosos</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {result.successful}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Registros Fallidos</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {result.failed}
              </p>
            </div>
          </div>

          {hasErrors && result.errors && result.errors.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Detalles de Errores</h4>
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  <div className="space-y-3">
                    {result.errors.map((error, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Fila {error.row} - Campo: {error.field}</AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc list-inside space-y-1 mt-2">
                            {error.messages.map((message, msgIndex) => (
                              <li key={msgIndex} className="text-sm">
                                {message}
                              </li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
};
