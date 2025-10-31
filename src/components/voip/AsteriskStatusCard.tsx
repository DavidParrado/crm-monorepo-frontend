import { RefreshCw } from "lucide-react";
import { AsteriskStatus } from "@/types/asterisk";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface AsteriskStatusCardProps {
  status: AsteriskStatus | null;
  isLoading: boolean;
  isChecking: boolean;
  onRefresh: () => void;
}

export function AsteriskStatusCard({ status, isLoading, isChecking, onRefresh }: AsteriskStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Estado de la Conexión</CardTitle>
            <CardDescription>
              Estado actual de la conexión con el servidor de Asterisk
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : status ? (
          <div className="flex items-center gap-4">
            <Badge
              variant={status.status === "Connected" ? "default" : "destructive"}
              className="text-lg px-4 py-2"
            >
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  status.status === "Connected" ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {status.status === "Connected" ? "Conectado" : "Desconectado"}
            </Badge>
            <p className="text-muted-foreground">{status.message}</p>
          </div>
        ) : (
          <p className="text-muted-foreground">No se pudo obtener el estado</p>
        )}
      </CardContent>
    </Card>
  );
}
