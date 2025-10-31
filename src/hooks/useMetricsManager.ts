import { useState, useEffect } from "react";
import { DashboardMetric } from "@/types/metric";
import { FilterOptions } from "@/types/filters";
import * as clientService from "@/services/clientService";
import { toast } from "sonner";

export const useMetricsManager = () => {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<DashboardMetric | null>(null);
  
  // Form states
  const [formName, setFormName] = useState("");
  const [formKey, setFormKey] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formDisplayOrder, setFormDisplayOrder] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  
  // Filter states
  const [filterField, setFilterField] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await clientService.getMetrics();
      setMetrics(data);
    } catch (error: any) {
      toast.error(error.message || "Error al cargar las métricas");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const data = await clientService.getFilterOptions();
      setFilterOptions(data);
    } catch (error: any) {
      toast.error(error.message || "Error al cargar las opciones de filtro");
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchFilterOptions();
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormKey("");
    setFormIcon("");
    setFormDisplayOrder("");
    setFormIsActive(true);
    setFilterField("");
    setFilterValue("");
  };

  const buildFilterObject = (): Record<string, number> => {
    if (!filterField || !filterValue) return {};
    
    // All fields are numeric IDs
    return {
      [filterField]: Number(filterValue)
    };
  };

  const parseFilterToFormFields = (filterCriteria: Record<string, number>) => {
    if (!filterCriteria || Object.keys(filterCriteria).length === 0) {
      return;
    }

    const field = Object.keys(filterCriteria)[0];
    const value = filterCriteria[field];

    setFilterField(field);
    setFilterValue(String(value));
  };

  const getFilterDisplayValue = (field: string, value: any): string => {
    if (field === "statusId" && filterOptions.statuses) {
      const status = filterOptions.statuses.find(s => s.id === Number(value));
      return status?.name || value;
    }
    if (field === "lastManagementId" && filterOptions.managements) {
      const management = filterOptions.managements.find(m => m.id === Number(value));
      return management?.name || value;
    }
    if (field === "groupId" && filterOptions.groups) {
      const group = filterOptions.groups.find(g => g.id === Number(value));
      return group?.name || value;
    }
    return value;
  };

  const renderFilterDisplay = (filterCriteria: Record<string, number>): string => {
    if (!filterCriteria || Object.keys(filterCriteria).length === 0) {
      return "Sin filtro";
    }

    const field = Object.keys(filterCriteria)[0];
    const value = filterCriteria[field];

    return `${field} = ${getFilterDisplayValue(field, value)}`;
  };

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    if (!formKey.trim()) {
      toast.error("La clave es requerida");
      return;
    }

    setIsSubmitting(true);
    try {
      const filterCriteria = buildFilterObject();
      await clientService.createMetric({
        name: formName,
        key: formKey,
        filterCriteria,
        icon: formIcon || undefined,
        displayOrder: formDisplayOrder ? Number(formDisplayOrder) : undefined,
        isActive: formIsActive,
      });
      toast.success("Métrica creada exitosamente");
      setShowCreateDialog(false);
      resetForm();
      fetchMetrics();
    } catch (error: any) {
      toast.error(error.message || "Error al crear la métrica");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedMetric) return;
    if (!formName.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    if (!formKey.trim()) {
      toast.error("La clave es requerida");
      return;
    }

    setIsSubmitting(true);
    try {
      const filterCriteria = buildFilterObject();
      await clientService.updateMetric(selectedMetric.id!, {
        name: formName,
        key: formKey,
        filterCriteria,
        icon: formIcon || undefined,
        displayOrder: formDisplayOrder ? Number(formDisplayOrder) : undefined,
        isActive: formIsActive,
      });
      toast.success("Métrica actualizada exitosamente");
      setShowEditDialog(false);
      resetForm();
      setSelectedMetric(null);
      fetchMetrics();
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar la métrica");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMetric) return;

    setIsSubmitting(true);
    try {
      await clientService.deleteMetric(selectedMetric.id!);
      toast.success("Métrica eliminada exitosamente");
      setShowDeleteDialog(false);
      setSelectedMetric(null);
      fetchMetrics();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar la métrica");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (metric: DashboardMetric) => {
    setSelectedMetric(metric);
    setFormName(metric.name);
    setFormKey(metric.key);
    setFormIcon(metric.icon || "");
    setFormDisplayOrder(metric.displayOrder?.toString() || "");
    setFormIsActive(metric.isActive ?? true);
    parseFilterToFormFields(metric.filterCriteria);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (metric: DashboardMetric) => {
    setSelectedMetric(metric);
    setShowDeleteDialog(true);
  };

  return {
    metrics,
    filterOptions,
    isLoading,
    isSubmitting,
    showCreateDialog,
    setShowCreateDialog,
    showEditDialog,
    setShowEditDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    selectedMetric,
    formName,
    setFormName,
    formKey,
    setFormKey,
    formIcon,
    setFormIcon,
    formDisplayOrder,
    setFormDisplayOrder,
    formIsActive,
    setFormIsActive,
    filterField,
    setFilterField,
    filterValue,
    setFilterValue,
    handleCreate,
    handleEdit,
    handleDelete,
    openEditDialog,
    openDeleteDialog,
    resetForm,
    renderFilterDisplay,
  };
};
