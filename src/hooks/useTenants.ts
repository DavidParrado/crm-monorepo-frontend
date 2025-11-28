import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import * as tenancyService from "@/services/tenancyService";
import { Tenant, CreateTenantData, UpdateTenantData } from "@/types/tenant";

// Form data types (exported for use in components)
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

// Schema for creating a tenant (includes admin credentials)
const createTenantSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  subdomain: z.string()
    .min(3, "El subdominio debe tener al menos 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// Schema for updating a tenant (no subdomain, username, or password)
const updateTenantSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export const useTenants = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

  // Fetch all tenants
  const { data: tenants = [], isLoading, error } = useQuery({
    queryKey: ['tenants'],
    queryFn: tenancyService.getAll,
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tenancyService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success("Tenant eliminado exitosamente");
      setIsDeleteDialogOpen(false);
      setTenantToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar el tenant");
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

  // Submit handlers
  const handleCreateSubmit = (data: CreateTenantFormData) => {
    createMutation.mutate(data);
  };

  const handleUpdateSubmit = (data: UpdateTenantFormData) => {
    if (selectedTenant) {
      updateMutation.mutate({ id: selectedTenant.id, data });
    }
  };

  return {
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
    
    // Modal actions
    openCreateModal,
    openEditModal,
    closeModal,
    
    // Delete dialog
    isDeleteDialogOpen,
    tenantToDelete,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    isDeleting: deleteMutation.isPending,
    
    // Submit actions
    handleCreateSubmit,
    handleUpdateSubmit,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
  };
};
