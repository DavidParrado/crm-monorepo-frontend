import { Badge } from '@/components/ui/badge';
import { IntegrationStatus } from '@/types/integrations';
import { Loader2 } from 'lucide-react';

interface IntegrationStatusBadgeProps {
  status: IntegrationStatus;
}

export const IntegrationStatusBadge = ({ status }: IntegrationStatusBadgeProps) => {
  switch (status) {
    case IntegrationStatus.CONNECTED:
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          Conectado
        </Badge>
      );
    case IntegrationStatus.DISCONNECTED:
      return (
        <Badge variant="destructive" className="gap-1.5">
          <span className="h-2 w-2 rounded-full bg-current" />
          Desconectado
        </Badge>
      );
    case IntegrationStatus.PROVISIONING:
      return (
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin" />
          Provisionando
        </Badge>
      );
    default:
      return <Badge variant="secondary">Desconocido</Badge>;
  }
};
