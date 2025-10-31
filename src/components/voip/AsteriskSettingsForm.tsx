import { AsteriskSettings } from "@/types/asterisk";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface AsteriskSettingsFormProps {
  settings: AsteriskSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  formData: { host: string; port: number; username: string; password: string; context: string; };
  onFormChange: (data: { host: string; port: number; username: string; password: string; context: string; }) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AsteriskSettingsForm({
  settings,
  isLoading,
  isSaving,
  formData,
  onFormChange,
  onSubmit,
}: AsteriskSettingsFormProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    onFormChange({
      ...formData,
      [id]: type === 'number' ? parseInt(value) : value,
    });
  };

  return (
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
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">Host *</Label>
                <Input 
                  id="host" 
                  value={formData.host} 
                  onChange={handleChange} 
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
                  onChange={handleChange} 
                  placeholder="5038"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Usuario *</Label>
                <Input 
                  id="username" 
                  value={formData.username} 
                  onChange={handleChange} 
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
                  onChange={handleChange} 
                  placeholder={settings ? "********" : ""}
                  required={!settings} 
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="context">Contexto *</Label>
                <Input 
                  id="context" 
                  value={formData.context} 
                  onChange={handleChange} 
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
  );
}
