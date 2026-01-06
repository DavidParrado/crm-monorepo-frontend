import { useImportProgress } from "@/hooks/useImportProgress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ImportStatusResponse } from "@/types/import";
import { CheckCircle2, XCircle, AlertCircle, Loader2, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportProgressTrackerProps {
  importId: number;
  fileName?: string;
  onComplete?: (result: ImportStatusResponse) => void;
  onNewImport?: () => void;
}

export const ImportProgressTracker = ({
  importId,
  fileName,
  onComplete,
  onNewImport,
}: ImportProgressTrackerProps) => {
  const { status, isPolling, error, isComplete } = useImportProgress({
    importId,
    pollingInterval: 2000,
    onComplete,
  });

  const getStatusConfig = () => {
    if (error) {
      return {
        icon: XCircle,
        iconClass: "text-destructive",
        progressClass: "bg-destructive",
        label: "Error de conexión",
        description: "No se pudo obtener el estado de la importación",
      };
    }

    if (!status) {
      return {
        icon: Loader2,
        iconClass: "text-primary animate-spin",
        progressClass: "",
        label: "Iniciando...",
        description: "Preparando la importación",
      };
    }

    switch (status.status) {
      case 'Pending':
        return {
          icon: Loader2,
          iconClass: "text-muted-foreground animate-spin",
          progressClass: "",
          label: "En cola",
          description: "Esperando procesamiento...",
        };
      case 'Processing':
        return {
          icon: Loader2,
          iconClass: "text-primary animate-spin",
          progressClass: "",
          label: "Procesando",
          description: status.detail || "Importando registros...",
        };
      case 'Completed':
        return {
          icon: CheckCircle2,
          iconClass: "text-green-500",
          progressClass: "[&>div]:bg-green-500",
          label: "Completado",
          description: `Se importaron ${status.successfulRecords?.toLocaleString() ?? 0} registros correctamente`,
        };
      case 'Completed with errors':
        return {
          icon: AlertCircle,
          iconClass: "text-yellow-500",
          progressClass: "[&>div]:bg-yellow-500",
          label: "Completado con errores",
          description: `${status.successfulRecords?.toLocaleString() ?? 0} exitosos, ${status.failedRecords?.toLocaleString() ?? 0} fallidos/duplicados`,
        };
      case 'Failed':
        return {
          icon: XCircle,
          iconClass: "text-destructive",
          progressClass: "[&>div]:bg-destructive",
          label: "Fallido",
          description: "Ocurrió un error crítico durante la importación",
        };
      default:
        return {
          icon: Loader2,
          iconClass: "text-muted-foreground animate-spin",
          progressClass: "",
          label: "Procesando...",
          description: "",
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;
  const progress = status?.progress ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <IconComponent className={cn("h-6 w-6", config.iconClass)} />
          {config.label}
        </CardTitle>
        {fileName && (
          <CardDescription className="flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            {fileName}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress 
            value={progress} 
            className={cn("h-3", config.progressClass)}
          />
        </div>

        <p className="text-sm text-muted-foreground text-center">
          {config.description}
        </p>

        {isComplete && status && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {status.successfulRecords?.toLocaleString() ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Exitosos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {status.failedRecords?.toLocaleString() ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Fallidos</p>
              </div>
            </div>

            {onNewImport && (
              <div className="flex justify-center">
                <Button onClick={onNewImport}>
                  Nueva Importación
                </Button>
              </div>
            )}
          </div>
        )}

        {error && onNewImport && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={onNewImport}>
              Reintentar
            </Button>
          </div>
        )}

        {isPolling && (
          <p className="text-xs text-muted-foreground text-center">
            Actualizando cada 2 segundos...
          </p>
        )}
      </CardContent>
    </Card>
  );
};
