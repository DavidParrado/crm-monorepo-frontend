import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useTenantChatwoot,
  useAccountInstances,
  useDeprovisionChatwoot,
  useDeleteEvolution,
} from '@/hooks/useIntegrations';
import { useSuperAdminPermissions } from '@/hooks/useSuperAdminPermissions';
import { ProvisionChatwootModal } from './ProvisionChatwootModal';
import { ProvisionEvolutionModal } from './ProvisionEvolutionModal';
import { DeleteIntegrationDialog } from './DeleteIntegrationDialog';
import { IntegrationStatusBadge } from './IntegrationStatusBadge';
import { InstanceNameDisplay } from './InstanceNameDisplay';
import {
  MessageSquare,
  ExternalLink,
  Plus,
  Trash2,
  Smartphone,
  AlertTriangle,
} from 'lucide-react';

interface TenantIntegrationsProps {
  tenantId: string;
  tenantName: string;
}

export const TenantIntegrations = ({ tenantId, tenantName }: TenantIntegrationsProps) => {
  const { canEditTenants } = useSuperAdminPermissions();

  const [showProvisionChatwoot, setShowProvisionChatwoot] = useState(false);
  const [showProvisionEvolution, setShowProvisionEvolution] = useState(false);
  const [showDeprovision, setShowDeprovision] = useState(false);
  const [instanceToDelete, setInstanceToDelete] = useState<string | null>(null);

  const { data: chatwootAccount, isLoading: isLoadingChatwoot } = useTenantChatwoot(tenantId);
  const { data: instancesData, isLoading: isLoadingInstances } = useAccountInstances(
    chatwootAccount?.id
  );

  const deprovisionMutation = useDeprovisionChatwoot();
  const deleteInstanceMutation = useDeleteEvolution();

  const handleDeprovision = async () => {
    await deprovisionMutation.mutateAsync(tenantId);
    setShowDeprovision(false);
  };

  const handleDeleteInstance = async () => {
    if (instanceToDelete) {
      await deleteInstanceMutation.mutateAsync(instanceToDelete);
      setInstanceToDelete(null);
    }
  };

  if (isLoadingChatwoot) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // State 1: Not Configured
  if (!chatwootAccount) {
    return (
      <>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-muted mb-4">
              <MessageSquare className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Sin Infraestructura de Comunicaciones</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              Este tenant no tiene una cuenta Chatwoot configurada. Provisiona una para habilitar
              canales de comunicación.
            </p>
            {canEditTenants && (
              <Button onClick={() => setShowProvisionChatwoot(true)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Provisionar Chatwoot
              </Button>
            )}
          </CardContent>
        </Card>

        <ProvisionChatwootModal
          open={showProvisionChatwoot}
          onOpenChange={setShowProvisionChatwoot}
          tenantId={tenantId}
          tenantName={tenantName}
        />
      </>
    );
  }

  // State 2: Configured
  return (
    <div className="space-y-6">
      {/* Chatwoot Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{chatwootAccount.name}</CardTitle>
              <CardDescription>Account ID: {chatwootAccount.accountId}</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={chatwootAccount.dashboardUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir Dashboard
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Creado: {new Date(chatwootAccount.createdAt).toLocaleDateString('es-ES')}
            </div>
            {canEditTenants && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeprovision(true)}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Desaprovisionar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Instances */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Smartphone className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Instancias WhatsApp</CardTitle>
              <CardDescription>Conexiones de WhatsApp vinculadas</CardDescription>
            </div>
          </div>
          {canEditTenants && (
            <Button size="sm" onClick={() => setShowProvisionEvolution(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Instancia
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingInstances ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !instancesData?.data.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Smartphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay instancias configuradas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instancesData.data.map((instance) => (
                  <TableRow key={instance.id}>
                    <TableCell>
                      <InstanceNameDisplay instanceName={instance.instanceName} showSlug />
                    </TableCell>
                    <TableCell>
                      <IntegrationStatusBadge status={instance.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {canEditTenants && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setInstanceToDelete(instance.instanceName)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <ProvisionEvolutionModal
        open={showProvisionEvolution}
        onOpenChange={setShowProvisionEvolution}
        chatwootAccountId={chatwootAccount.id}
        accountName={chatwootAccount.name}
      />

      <DeleteIntegrationDialog
        open={showDeprovision}
        onOpenChange={setShowDeprovision}
        onConfirm={handleDeprovision}
        isLoading={deprovisionMutation.isPending}
        title="Desaprovisionar Chatwoot"
        description="Esta acción eliminará la cuenta Chatwoot y TODAS las instancias WhatsApp asociadas. Esta acción no se puede deshacer."
        destructive
      />

      <DeleteIntegrationDialog
        open={!!instanceToDelete}
        onOpenChange={(open) => !open && setInstanceToDelete(null)}
        onConfirm={handleDeleteInstance}
        isLoading={deleteInstanceMutation.isPending}
        title="Eliminar Instancia"
        description="¿Estás seguro de eliminar esta instancia de WhatsApp? La conexión se perderá permanentemente."
      />
    </div>
  );
};
