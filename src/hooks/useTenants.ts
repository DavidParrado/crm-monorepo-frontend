import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import * as tenancyService from "@/services/tenancyService";
import { Tenant, CreateTenantData, UpdateTenantData } from "@/types/tenant";

// Form data types
export interface CreateTenantFormData {
  name: string;
  subdomain: string;
  username: string;
  password: string;
}

export interface UpdateTenantFormData {
  name: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

// Schemas
const createTenantSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  subdomain: z.string()
    .min(3, "El subdominio debe tener al menos 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const updateTenantSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type TenantTab = 'active' | 'trash';

export const useTenants = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TenantTab>('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [isHardDeleteDialogOpen, setIsHardDeleteDialogOpen] = useState(false);
  const [tenantToHardDelete, setTenantToHardDelete] = useState<Tenant | null>(null);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [tenantToResetPassword, setTenantToResetPassword] = useState<Tenant | null>(null);

  // Fetch tenants based on active tab
  const { data: tenants = [], isLoading, error } = useQuery({
    queryKey: ['tenants', activeTab],
    queryFn: () => tenancyService.getAll({ trashed: activeTab === 'trash' }),
  });

  // Create form
  const createForm = useForm<CreateTenantFormData>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      name: '',
      subdomain: '',
      username: '',
      password: '',
    },
  });

  // Update form
  const updateForm = useForm<UpdateTenantFormData>({
    resolver: zodResolver(updateTenantSchema),
    defaultValues: {
      name: '',
      status: 'ACTIVE',
    },
  });

  // Reset password form
  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateTenantData) => tenancyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success("Tenant creado exitosamente");
      closeModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear el tenant");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenantData }) => 
      tenancyService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success("Tenant actualizado exitosamente");
      closeModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar el tenant");
    },
  });

  // Soft delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tenancyService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success("Tenant movido a la papelera");
      setIsDeleteDialogOpen(false);
      setTenantToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar el tenant");
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: (id: string) => tenancyService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success("Tenant restaurado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al restaurar el tenant");
    },
  });

  // Hard delete mutation
  const hardDeleteMutation = useMutation({
    mutationFn: (id: string) => tenancyService.hardDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success("Tenant eliminado permanentemente");
      setIsHardDeleteDialogOpen(false);
      setTenantToHardDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar el tenant");
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => 
      tenancyService.resetTenantPassword(id, password),
    onSuccess: () => {
      toast.success("Contraseña restablecida exitosamente");
      closeResetPasswordModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al restablecer la contraseña");
    },
  });

  // Modal handlers
  const openCreateModal = () => {
    setModalMode('CREATE');
    setSelectedTenant(null);
    createForm.reset({
      name: '',
      subdomain: '',
      username: '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tenant: Tenant) => {
    setModalMode('EDIT');
    setSelectedTenant(tenant);
    updateForm.reset({
      name: tenant.name,
      status: tenant.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTenant(null);
    createForm.reset();
    updateForm.reset();
  };

  // Delete handlers
  const openDeleteDialog = (tenant: Tenant) => {
    setTenantToDelete(tenant);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setTenantToDelete(null);
  };

  const confirmDelete = () => {
    if (tenantToDelete) {
      deleteMutation.mutate(tenantToDelete.id);
    }
  };

  // Hard delete handlers
  const openHardDeleteDialog = (tenant: Tenant) => {
    setTenantToHardDelete(tenant);
    setIsHardDeleteDialogOpen(true);
  };

  const closeHardDeleteDialog = () => {
    setIsHardDeleteDialogOpen(false);
    setTenantToHardDelete(null);
  };

  const confirmHardDelete = () => {
    if (tenantToHardDelete) {
      hardDeleteMutation.mutate(tenantToHardDelete.id);
    }
  };

  // Reset password handlers
  const openResetPasswordModal = (tenant: Tenant) => {
    setTenantToResetPassword(tenant);
    resetPasswordForm.reset({
      password: '',
      confirmPassword: '',
    });
    setIsResetPasswordModalOpen(true);
  };

  const closeResetPasswordModal = () => {
    setIsResetPasswordModalOpen(false);
    setTenantToResetPassword(null);
    resetPasswordForm.reset();
  };

  // Restore handler
  const handleRestore = (tenant: Tenant) => {
    restoreMutation.mutate(tenant.id);
  };

  // Submit handlers
  const handleCreateSubmit = (data: CreateTenantFormData) => {
    createMutation.mutate(data);
  };

  const handleUpdateSubmit = (data: UpdateTenantFormData) => {
    if (selectedTenant) {
      updateMutation.mutate({ id: selectedTenant.id, data });
    }
  };

  const handleResetPasswordSubmit = (data: ResetPasswordFormData) => {
    if (tenantToResetPassword) {
      resetPasswordMutation.mutate({ id: tenantToResetPassword.id, password: data.password });
    }
  };

  return {
    // Tab state
    activeTab,
    setActiveTab,
    
    // Data
    tenants,
    isLoading,
    error,
    
    // Modal state
    isModalOpen,
    modalMode,
    selectedTenant,
    
    // Forms
    createForm,
    updateForm,
    resetPasswordForm,
    
    // Modal actions
    openCreateModal,
    openEditModal,
    closeModal,
    
    // Soft delete dialog
    isDeleteDialogOpen,
    tenantToDelete,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    isDeleting: deleteMutation.isPending,
    
    // Hard delete dialog
    isHardDeleteDialogOpen,
    tenantToHardDelete,
    openHardDeleteDialog,
    closeHardDeleteDialog,
    confirmHardDelete,
    isHardDeleting: hardDeleteMutation.isPending,
    
    // Reset password modal
    isResetPasswordModalOpen,
    tenantToResetPassword,
    openResetPasswordModal,
    closeResetPasswordModal,
    handleResetPasswordSubmit,
    isResettingPassword: resetPasswordMutation.isPending,
    
    // Restore
    handleRestore,
    isRestoring: restoreMutation.isPending,
    
    // Submit actions
    handleCreateSubmit,
    handleUpdateSubmit,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
  };
};
