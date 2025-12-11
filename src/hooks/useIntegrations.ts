import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { integrationsService } from '@/services/integrationsService';
import { ProvisionChatwootDto, CreateEvolutionInstanceDto } from '@/types/integrations';
import { toast } from 'sonner';

// Schemas
export const provisionChatwootSchema = z.object({
  accountName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  adminName: z.string().min(2, 'El nombre del admin es requerido'),
  adminEmail: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional(),
});

export const provisionEvolutionSchema = z.object({
  instanceName: z.string().min(2, 'El nombre de la instancia es requerido'),
  organization: z.string().optional(),
});

export type ProvisionChatwootFormData = z.infer<typeof provisionChatwootSchema>;
export type ProvisionEvolutionFormData = z.infer<typeof provisionEvolutionSchema>;

// Queries
export const useChatwootAccounts = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['chatwoot-accounts', page, limit],
    queryFn: () => integrationsService.getChatwootAccounts(page, limit),
  });
};

export const useEvolutionInstances = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['evolution-instances', page, limit],
    queryFn: () => integrationsService.getEvolutionInstances(page, limit),
  });
};

export const useTenantChatwoot = (tenantId: string | undefined) => {
  return useQuery({
    queryKey: ['tenant-chatwoot', tenantId],
    queryFn: () => integrationsService.getChatwootByTenant(tenantId!),
    enabled: !!tenantId,
  });
};

export const useAccountInstances = (
  chatwootAccountId: string | undefined,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: ['account-instances', chatwootAccountId, page, limit],
    queryFn: () => integrationsService.getEvolutionByAccount(chatwootAccountId!, page, limit),
    enabled: !!chatwootAccountId,
  });
};

// Mutations
export const useProvisionChatwoot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProvisionChatwootDto) => integrationsService.provisionChatwoot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatwoot-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-chatwoot'] });
      toast.success('Cuenta Chatwoot provisionada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al provisionar: ${error.message}`);
    },
  });
};

export const useDeprovisionChatwoot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tenantId: string) => integrationsService.deprovisionChatwoot(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatwoot-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-chatwoot'] });
      toast.success('Cuenta Chatwoot eliminada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar: ${error.message}`);
    },
  });
};

export const useDeleteChatwootAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => integrationsService.deleteChatwootAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatwoot-accounts'] });
      toast.success('Cuenta eliminada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar: ${error.message}`);
    },
  });
};

export const useProvisionEvolution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEvolutionInstanceDto) => integrationsService.provisionEvolution(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution-instances'] });
      queryClient.invalidateQueries({ queryKey: ['account-instances'] });
      toast.success('Instancia WhatsApp provisionada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al provisionar: ${error.message}`);
    },
  });
};

export const useDeleteEvolution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (instanceName: string) => integrationsService.deleteEvolutionInstance(instanceName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution-instances'] });
      queryClient.invalidateQueries({ queryKey: ['account-instances'] });
      toast.success('Instancia eliminada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar: ${error.message}`);
    },
  });
};

// Form Hooks
export const useProvisionChatwootForm = () => {
  const form = useForm<ProvisionChatwootFormData>({
    resolver: zodResolver(provisionChatwootSchema),
    defaultValues: {
      accountName: '',
      adminName: '',
      adminEmail: '',
      password: '',
    },
  });

  return form;
};

export const useProvisionEvolutionForm = () => {
  const form = useForm<ProvisionEvolutionFormData>({
    resolver: zodResolver(provisionEvolutionSchema),
    defaultValues: {
      instanceName: '',
      organization: '',
    },
  });

  return form;
};

// Utility: Slugify instance name
export const slugifyInstanceName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Utility: Deslugify instance name
export const deslugifyInstanceName = (slug: string): string => {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
