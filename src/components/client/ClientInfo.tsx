import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, User, Users, Calendar } from "lucide-react";
import { Client } from "@/types/client";



interface ClientInfoProps {
  client: Client;
  children?: React.ReactNode;
}

export function ClientInfo({ client, children }: ClientInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Cliente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-sm">{client.email ?? 'No disponible'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
            <p className="text-sm">{client.phone ?? 'No disponible'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <User className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Estado</p>
            <Badge variant="outline" className="mt-1">
              {client.status.name ?? 'No disponible'}
            </Badge>
          </div>
        </div>

        {client.group && (
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Grupo</p>
              <p className="text-sm">{client.group.name ?? 'No disponible'}</p>
            </div>
          </div>
        )}

        {client.assignedTo && (
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Asignado a</p>
              <p className="text-sm">
                {client.assignedTo.firstName} {client.assignedTo?.lastName ?? ''}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Fecha de Creación</p>
            <p className="text-sm">
              {new Date(client.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
