import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useChatwootAccounts,
  useEvolutionInstances,
  useDeleteChatwootAccount,
  useDeleteEvolution,
} from '@/hooks/useIntegrations';
import { useSuperAdminPermissions } from '@/hooks/useSuperAdminPermissions';
import { IntegrationStatusBadge } from '@/components/integrations/IntegrationStatusBadge';
import { InstanceNameDisplay } from '@/components/integrations/InstanceNameDisplay';
import { DeleteIntegrationDialog } from '@/components/integrations/DeleteIntegrationDialog';
import { ProvisionEvolutionModal } from '@/components/integrations/ProvisionEvolutionModal';
import {
  MessageSquare,
  Smartphone,
  Trash2,
  Info,
  Server,
  Plus,
} from 'lucide-react';
import { ChatwootAccount, EvolutionInstance } from '@/types/integrations';

const Integrations = () => {
  const { canEditTenants } = useSuperAdminPermissions();

  const [chatwootPage] = useState(1);
  const [evolutionPage] = useState(1);
  const [accountToDelete, setAccountToDelete] = useState<ChatwootAccount | null>(null);
  const [instanceToDelete, setInstanceToDelete] = useState<EvolutionInstance | null>(null);
  
  // Evolution provisioning modals
  const [provisionEvolutionOpen, setProvisionEvolutionOpen] = useState(false);
  const [quickProvisionAccount, setQuickProvisionAccount] = useState<ChatwootAccount | null>(null);

  const { data: chatwootData, isLoading: isLoadingChatwoot } = useChatwootAccounts(chatwootPage);
  const { data: evolutionData, isLoading: isLoadingEvolution } = useEvolutionInstances(evolutionPage);

  const deleteAccountMutation = useDeleteChatwootAccount();
  const deleteInstanceMutation = useDeleteEvolution();

  const handleDeleteAccount = async () => {
    if (accountToDelete) {
      await deleteAccountMutation.mutateAsync(accountToDelete.id);
      setAccountToDelete(null);
    }
  };

  const handleDeleteInstance = async () => {
    if (instanceToDelete) {
      await deleteInstanceMutation.mutateAsync(instanceToDelete.instanceName);
      setInstanceToDelete(null);
    }
  };

  // Check if account has evolution instances linked
  const getAccountInstanceCount = (accountId: string): number => {
    return evolutionData?.data.filter(
      (instance) => instance.chatwootAccount?.id === accountId
    ).length || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <Server className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Integraciones</h1>
          <p className="text-muted-foreground">
            Gestión global de infraestructura de comunicaciones
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="chatwoot" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="chatwoot" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Chatwoot
          </TabsTrigger>
          <TabsTrigger value="evolution" className="gap-2">
            <Smartphone className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        {/* Chatwoot Tab */}
        <TabsContent value="chatwoot">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cuentas Chatwoot</CardTitle>
                  <CardDescription>
                    Todas las cuentas de soporte omnicanal provisionadas
                  </CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" disabled>
                        Nueva Cuenta Standalone
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Requiere asociar a un Tenant</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingChatwoot ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !chatwootData?.data.length ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No hay cuentas Chatwoot</p>
                  <p className="text-sm">Las cuentas se crean desde la vista de Tenants</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Account ID</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chatwootData.data.map((account) => {
                      const instanceCount = getAccountInstanceCount(account.id);
                      
                      return (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">{account.name}</TableCell>
                          <TableCell>
                            {account.tenant ? (
                              <Badge variant="secondary">{account.tenant.name}</Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                Standalone
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {account.accountId}
                            </code>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(account.createdAt).toLocaleDateString('es-ES')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Quick Provision WhatsApp Button */}
                              {canEditTenants && instanceCount === 0 && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setQuickProvisionAccount(account)}
                                      >
                                        <Smartphone className="h-4 w-4 text-emerald-500" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Agregar WhatsApp</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              
                              {/* Delete / Info */}
                              {account.tenant ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" disabled>
                                        <Info className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Desaprovisionar desde Detalles del Tenant</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : canEditTenants ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setAccountToDelete(account)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evolution Tab */}
        <TabsContent value="evolution">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Instancias WhatsApp</CardTitle>
                  <CardDescription>
                    Todas las conexiones de WhatsApp vía Evolution API
                  </CardDescription>
                </div>
                {canEditTenants && (
                  <Button onClick={() => setProvisionEvolutionOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Instancia
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingEvolution ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !evolutionData?.data.length ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No hay instancias WhatsApp</p>
                  <p className="text-sm">
                    Crea una nueva instancia para comenzar
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Instancia</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Cuenta Vinculada</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evolutionData.data.map((instance) => (
                      <TableRow key={instance.id}>
                        <TableCell>
                          <InstanceNameDisplay instanceName={instance.instanceName} showSlug />
                        </TableCell>
                        <TableCell>
                          <IntegrationStatusBadge status={instance.status} />
                        </TableCell>
                        <TableCell>
                          {instance.chatwootAccount ? (
                            <Badge variant="secondary">{instance.chatwootAccount.name}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(instance.createdAt).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell className="text-right">
                          {canEditTenants && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setInstanceToDelete(instance)}
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
        </TabsContent>
      </Tabs>

      {/* Delete Dialogs */}
      <DeleteIntegrationDialog
        open={!!accountToDelete}
        onOpenChange={(open) => !open && setAccountToDelete(null)}
        onConfirm={handleDeleteAccount}
        isLoading={deleteAccountMutation.isPending}
        title="Eliminar Cuenta Chatwoot"
        description="¿Estás seguro de eliminar esta cuenta? Se perderán todos los datos de conversaciones."
        destructive
      />

      <DeleteIntegrationDialog
        open={!!instanceToDelete}
        onOpenChange={(open) => !open && setInstanceToDelete(null)}
        onConfirm={handleDeleteInstance}
        isLoading={deleteInstanceMutation.isPending}
        title="Eliminar Instancia WhatsApp"
        description="¿Estás seguro de eliminar esta instancia? La conexión se perderá permanentemente."
      />

      {/* Provision Evolution Modal - Global (with account selector) */}
      <ProvisionEvolutionModal
        open={provisionEvolutionOpen}
        onOpenChange={setProvisionEvolutionOpen}
      />

      {/* Quick Provision Evolution Modal - Pre-selected account */}
      <ProvisionEvolutionModal
        open={!!quickProvisionAccount}
        onOpenChange={(open) => !open && setQuickProvisionAccount(null)}
        chatwootAccountId={quickProvisionAccount?.id}
        accountName={quickProvisionAccount?.name}
      />
    </div>
  );
};

export default Integrations;
