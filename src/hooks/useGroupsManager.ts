import { useState, useEffect } from "react";
import { Group } from "@/types/group";
import * as settingsService from "@/services/settingsService";
import { toast } from "sonner";

export const useGroupsManager = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const data = await settingsService.getGroups();
      setGroups(data);
    } catch (error: any) {
      toast.error(error.message || "Error al cargar los grupos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    setIsSubmitting(true);
    try {
      await settingsService.createGroup({ name: formData.name });
      toast.success("Grupo creado exitosamente");
      setIsCreateOpen(false);
      setFormData({ name: "" });
      fetchGroups();
    } catch (error: any) {
      toast.error(error.message || "Error al crear el grupo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedGroup) return;
    if (!formData.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    setIsSubmitting(true);
    try {
      await settingsService.updateGroup(selectedGroup.id, { name: formData.name });
      toast.success("Grupo actualizado exitosamente");
      setIsEditOpen(false);
      setFormData({ name: "" });
      setSelectedGroup(null);
      fetchGroups();
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar el grupo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGroup) return;

    setIsSubmitting(true);
    try {
      await settingsService.deleteGroup(selectedGroup.id);
      toast.success("Grupo eliminado exitosamente");
      setIsDeleteOpen(false);
      setSelectedGroup(null);
      fetchGroups();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar el grupo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (group: Group) => {
    setSelectedGroup(group);
    setFormData({ name: group.name });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (group: Group) => {
    setSelectedGroup(group);
    setIsDeleteOpen(true);
  };

  return {
    groups,
    isLoading,
    isCreateOpen,
    setIsCreateOpen,
    isEditOpen,
    setIsEditOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    selectedGroup,
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
