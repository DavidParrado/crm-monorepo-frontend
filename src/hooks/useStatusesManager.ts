import { useState, useEffect } from "react";
import { Status } from "@/types/status";
import * as settingsService from "@/services/settingsService";
import { toast } from "sonner";

export const useStatusesManager = () => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStatuses = async () => {
    setIsLoading(true);
    try {
      const data = await settingsService.getStatuses();
      setStatuses(data);
    } catch (error: any) {
      toast.error(error.message || "Error al cargar los estados");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    setIsSubmitting(true);
    try {
      await settingsService.createStatus({ name: formData.name });
      toast.success("Estado creado exitosamente");
      setIsCreateOpen(false);
      setFormData({ name: "" });
      fetchStatuses();
    } catch (error: any) {
      toast.error(error.message || "Error al crear el estado");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedStatus) return;
    if (!formData.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    setIsSubmitting(true);
    try {
      await settingsService.updateStatus(selectedStatus.id, { name: formData.name });
      toast.success("Estado actualizado exitosamente");
      setIsEditOpen(false);
      setFormData({ name: "" });
      setSelectedStatus(null);
      fetchStatuses();
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar el estado");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStatus) return;

    setIsSubmitting(true);
    try {
      await settingsService.deleteStatus(selectedStatus.id);
      toast.success("Estado eliminado exitosamente");
      setIsDeleteOpen(false);
      setSelectedStatus(null);
      fetchStatuses();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar el estado");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (status: Status) => {
    setSelectedStatus(status);
    setFormData({ name: status.name });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (status: Status) => {
    setSelectedStatus(status);
    setIsDeleteOpen(true);
  };

  return {
    statuses,
    isLoading,
    isCreateOpen,
    setIsCreateOpen,
    isEditOpen,
    setIsEditOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    selectedStatus,
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
