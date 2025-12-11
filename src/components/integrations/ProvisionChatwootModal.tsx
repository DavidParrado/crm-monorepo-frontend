import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProvisionChatwootForm, useProvisionChatwoot } from '@/hooks/useIntegrations';
import { Loader2, MessageSquare } from 'lucide-react';

interface ProvisionChatwootModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  tenantName?: string;
}

export const ProvisionChatwootModal = ({
  open,
  onOpenChange,
  tenantId,
  tenantName,
}: ProvisionChatwootModalProps) => {
  const form = useProvisionChatwootForm();
  const provisionMutation = useProvisionChatwoot();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = handleSubmit(async (data) => {
    await provisionMutation.mutateAsync({
      accountName: data.accountName,
      adminName: data.adminName,
      adminEmail: data.adminEmail,
      password: data.password,
      tenantId,
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Provisionar Chatwoot</DialogTitle>
              <DialogDescription>
                {tenantName
                  ? `Crear cuenta para ${tenantName}`
                  : 'Configurar infraestructura de comunicaciones'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="accountName">Nombre de la Cuenta</Label>
            <Input
              id="accountName"
              placeholder="Ej: Soporte Principal"
              {...register('accountName')}
            />
            {errors.accountName && (
              <p className="text-sm text-destructive">{errors.accountName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adminName">Nombre del Admin</Label>
              <Input
                id="adminName"
                placeholder="Nombre completo"
                {...register('adminName')}
              />
              {errors.adminName && (
                <p className="text-sm text-destructive">{errors.adminName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email del Admin</Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@empresa.com"
                {...register('adminEmail')}
              />
              {errors.adminEmail && (
                <p className="text-sm text-destructive">{errors.adminEmail.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña (Opcional)</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Si no se proporciona, se generará una automáticamente.
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={provisionMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={provisionMutation.isPending}>
              {provisionMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Provisionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
