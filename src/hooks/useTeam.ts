import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import * as iamService from "@/services/iamService";
import { SuperAdminUser, CreateTeamMemberData, UpdateTeamMemberData, SuperAdminRole } from "@/types/tenant";

// Form data types
export interface CreateMemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: SuperAdminRole;
}

export interface UpdateMemberFormData {
  firstName: string;
  lastName: string;
  role: SuperAdminRole;
  status: 'ACTIVE' | 'INACTIVE';
}

// Schemas
const createMemberSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["ROOT", "ADMIN", "SUPPORT"]),
});

const updateMemberSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  role: z.enum(["ROOT", "ADMIN", "SUPPORT"]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export const useTeam = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [selectedMember, setSelectedMember] = useState<SuperAdminUser | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<SuperAdminUser | null>(null);

  // Fetch team members
  const { data: team = [], isLoading, error } = useQuery({
    queryKey: ['team'],
    queryFn: iamService.getTeam,
  });

  // Create form
  const createForm = useForm<CreateMemberFormData>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'SUPPORT',
    },
  });

  // Update form
  const updateForm = useForm<UpdateMemberFormData>({
    resolver: zodResolver(updateMemberSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      role: 'SUPPORT',
      status: 'ACTIVE',
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateTeamMemberData) => iamService.inviteMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      toast.success("Miembro agregado exitosamente");
      closeModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al agregar miembro");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamMemberData }) => 
      iamService.updateMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      toast.success("Miembro actualizado exitosamente");
      closeModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar miembro");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => iamService.removeMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      toast.success("Miembro eliminado exitosamente");
      setIsDeleteDialogOpen(false);
      setMemberToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar miembro");
    },
  });

  // Modal handlers
  const openCreateModal = () => {
    setModalMode('CREATE');
    setSelectedMember(null);
    createForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'SUPPORT',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (member: SuperAdminUser) => {
    setModalMode('EDIT');
    setSelectedMember(member);
    updateForm.reset({
      firstName: member.firstName,
      lastName: member.lastName,
      role: member.role,
      status: member.status || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
    createForm.reset();
    updateForm.reset();
  };

  // Delete handlers
  const openDeleteDialog = (member: SuperAdminUser) => {
    setMemberToDelete(member);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setMemberToDelete(null);
  };

  const confirmDelete = () => {
    if (memberToDelete) {
      deleteMutation.mutate(memberToDelete.id);
    }
  };

  // Submit handlers
  const handleCreateSubmit = (data: CreateMemberFormData) => {
    createMutation.mutate(data);
  };

  const handleUpdateSubmit = (data: UpdateMemberFormData) => {
    if (selectedMember) {
      updateMutation.mutate({ id: selectedMember.id, data });
    }
  };

  return {
    team,
    isLoading,
    error,
    isModalOpen,
    modalMode,
    selectedMember,
    createForm,
    updateForm,
    openCreateModal,
    openEditModal,
    closeModal,
    isDeleteDialogOpen,
    memberToDelete,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    isDeleting: deleteMutation.isPending,
    handleCreateSubmit,
    handleUpdateSubmit,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
  };
};
