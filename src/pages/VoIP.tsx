import { useState, useEffect } from "react";
import { Phone, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { API_URL } from "@/lib/constants";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface AsteriskSettings {
  id: number;
  host: string;
  port: number;
  username: string;
  context: string;
}

interface AsteriskStatus {
  status: "Connected" | "Disconnected";
  message: string;
}

export default function VoIP() {
  const { token } = useAuthStore();
  
  const [settings, setSettings] = useState<AsteriskSettings | null>(null);
  const [status, setStatus] = useState<AsteriskStatus | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  
  const [formData, setFormData] = useState({
    host: "",
    port: 5038,
    username: "",
    password: "",
    context: "",
  });

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/asterisk/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setFormData({
          host: data.host || "",
          port: data.port || 5038,
          username: data.username || "",
          password: "",
          context: data.context || "",
        });
      } else if (response.status === 404) {
        setSettings(null);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Error al cargar la configuración");
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const fetchStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const response = await fetch(`${API_URL}/asterisk/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Error fetching status:", error);
      setStatus({
        status: "Disconnected",
        message: "Error al verificar el estado de la conexión",
      });
    } finally {
      setIsLoadingStatus(false);
      setIsCheckingStatus(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const method = settings ? "PATCH" : "POST";
      const body: any = {
        host: formData.host,
        port: formData.port,
        username: formData.username,
        context: formData.context,
      };

      if (formData.password) {
        body.password = formData.password;
      }

      const response = await fetch(`${API_URL}/asterisk/settings`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(
          settings
            ? "Configuración actualizada exitosamente"
            : "Configuración creada exitosamente"
        );
        await fetchSettings();
        await fetchStatus();
        setFormData(prev => ({ ...prev, password: "" }));
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al guardar la configuración");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error al guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshStatus = () => {
    fetchStatus();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Phone className="h-8 w-8" />
          VoIP / Asterisk
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona la configuración de Asterisk y verifica el estado de la conexión
        </p>
      </div>

      {/* Status Card */}
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
              onClick={handleRefreshStatus}
              disabled={isCheckingStatus}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isCheckingStatus ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingStatus ? (
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
                {status.status}
              </Badge>
              <p className="text-muted-foreground">{status.message}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">No se pudo obtener el estado</p>
          )}
        </CardContent>
      </Card>

      {/* Settings Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {settings ? "Configuración de Asterisk" : "Crear Configuración de Asterisk"}
          </CardTitle>
          <CardDescription>
            {settings
              ? "Actualiza los parámetros de conexión con el servidor de Asterisk"
              : "Configura los parámetros de conexión con el servidor de Asterisk por primera vez"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSettings ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Host *</Label>
                  <Input
                    id="host"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    placeholder="pbx.servidor.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="port">Puerto *</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                    placeholder="5038"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Usuario *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="crmuser"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Contraseña {settings && "(dejar vacío para no cambiar)"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={settings ? "********" : ""}
                    required={!settings}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="context">Contexto *</Label>
                  <Input
                    id="context"
                    value={formData.context}
                    onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                    placeholder="clicktocall"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Guardando..." : settings ? "Actualizar Configuración" : "Crear Configuración"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
