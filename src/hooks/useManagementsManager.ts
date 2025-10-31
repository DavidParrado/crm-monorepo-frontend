import { useState, useEffect } from "react";
import { Management } from "@/types/management";
import { Group } from "@/types/group";
import * as settingsService from "@/services/settingsService";
import { toast } from "sonner";

export const useManagementsManager = () => {
  const [managements, setManagements] = useState<Management[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedManagement, setSelectedManagement] = useState<Management | null>(null);
  const [formData, setFormData] = useState({ name: "", groupId: null as number | null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchManagements = async () => {
    setIsLoading(true);
    try {
      const data = await settingsService.getManagements();
      setManagements(data);
    } catch (error: any) {
      toast.error(error.message || "Error al cargar las gerencias");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const data = await settingsService.getGroups();
      setGroups(data);
    } catch (error: any) {
      toast.error(error.message || "Error al cargar los grupos");
    }
  };

  useEffect(() => {
    fetchManagements();
    fetchGroups();
  }, []);

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    setIsSubmitting(true);
    try {
      await settingsService.createManagement({
        name: formData.name,
        groupId: formData.groupId,
      });
      toast.success("Gerencia creada exitosamente");
      setIsCreateOpen(false);
      setFormData({ name: "", groupId: null });
      fetchManagements();
    } catch (error: any) {
      toast.error(error.message || "Error al crear la gerencia");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedManagement) return;
    if (!formData.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    setIsSubmitting(true);
    try {
      await settingsService.updateManagement(selectedManagement.id, {
        name: formData.name,
        groupId: formData.groupId,
      });
      toast.success("Gerencia actualizada exitosamente");
      setIsEditOpen(false);
      setFormData({ name: "", groupId: null });
      setSelectedManagement(null);
      fetchManagements();
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar la gerencia");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedManagement) return;

    setIsSubmitting(true);
    try {
      await settingsService.deleteManagement(selectedManagement.id);
      toast.success("Gerencia eliminada exitosamente");
      setIsDeleteOpen(false);
      setSelectedManagement(null);
      fetchManagements();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar la gerencia");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (management: Management) => {
    setSelectedManagement(management);
    setFormData({
      name: management.name,
      groupId: management.groupId || null,
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (management: Management) => {
    setSelectedManagement(management);
    setIsDeleteOpen(true);
  };

  return {
    managements,
    groups,
    isLoading,
    isCreateOpen,
    setIsCreateOpen,
    isEditOpen,
    setIsEditOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    selectedManagement,
    formData,
    setFormData,
    isSubmitting,
    handleCreate,
    handleEdit,
    handleDelete,
    openEditDialog,
    openDeleteDialog,
  };
};
