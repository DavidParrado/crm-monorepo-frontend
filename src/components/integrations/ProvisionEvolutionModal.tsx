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
import {
  useProvisionEvolutionForm,
  useProvisionEvolution,
  slugifyInstanceName,
} from '@/hooks/useIntegrations';
import { Loader2, Smartphone } from 'lucide-react';

interface ProvisionEvolutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatwootAccountId: string;
  accountName?: string;
}

export const ProvisionEvolutionModal = ({
  open,
  onOpenChange,
  chatwootAccountId,
  accountName,
}: ProvisionEvolutionModalProps) => {
  const form = useProvisionEvolutionForm();
  const provisionMutation = useProvisionEvolution();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = form;

  const instanceName = watch('instanceName');
  const slugPreview = instanceName ? slugifyInstanceName(instanceName) : '';

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = handleSubmit(async (data) => {
    await provisionMutation.mutateAsync({
      instanceName: data.instanceName,
      organization: data.organization,
      chatwootAccountId,
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Smartphone className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <DialogTitle>Nueva Instancia WhatsApp</DialogTitle>
              <DialogDescription>
                {accountName
                  ? `Vincular a cuenta: ${accountName}`
                  : 'Crear nueva conexión de WhatsApp'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="instanceName">Nombre de la Instancia</Label>
            <Input
              id="instanceName"
              placeholder="Ej: Ventas Medellín"
              {...register('instanceName')}
            />
            {errors.instanceName && (
              <p className="text-sm text-destructive">{errors.instanceName.message}</p>
            )}
            {slugPreview && (
              <p className="text-xs text-muted-foreground">
                Se creará como ID:{' '}
                <code className="px-1.5 py-0.5 rounded bg-muted font-mono">
                  {slugPreview}
                </code>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organización (Opcional)</Label>
            <Input
              id="organization"
              placeholder="Ej: Sucursal Norte"
              {...register('organization')}
            />
            <p className="text-xs text-muted-foreground">
              Útil para agrupar instancias por área o región.
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
              Crear Instancia
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
