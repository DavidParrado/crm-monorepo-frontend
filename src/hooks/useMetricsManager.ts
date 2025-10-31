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
  const [filterOperator, setFilterOperator] = useState<string>("");
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
    setFilterOperator("");
    setFilterValue("");
  };

  const buildFilterObject = (): Record<string, any> => {
    if (!filterField || !filterValue) return {};
    
    const filterCriteria: Record<string, any> = {};
    
    // Default to "equals" operator if not specified
    const operator = filterOperator || "equals";
    
    // Fields that should be converted to numbers
    const numericFields = ["statusId", "lastManagementId", "groupId"];
    
    if (operator === "equals") {
      // Convert to number for numeric fields
      const value = numericFields.includes(filterField) 
        ? Number(filterValue) 
        : filterValue;
      filterCriteria[filterField] = value;
    } else if (operator === "in") {
      const values = filterValue.split(",").map(v => v.trim());
      // Convert to numbers for numeric fields
      const processedValues = numericFields.includes(filterField)
        ? values.map(v => Number(v))
        : values;
      filterCriteria[filterField] = { $in: processedValues };
    } else if (operator === "between") {
      const [start, end] = filterValue.split(",").map(v => v.trim());
      // Convert to numbers for numeric fields
      const processedStart = numericFields.includes(filterField) ? Number(start) : start;
      const processedEnd = numericFields.includes(filterField) ? Number(end) : end;
      filterCriteria[filterField] = { $gte: processedStart, $lte: processedEnd };
    }
    
    return filterCriteria;
  };

  const parseFilterToFormFields = (filterCriteria: Record<string, any>) => {
    if (!filterCriteria || Object.keys(filterCriteria).length === 0) {
      return;
    }

    const field = Object.keys(filterCriteria)[0];
    const value = filterCriteria[field];

    setFilterField(field);

    if (typeof value === "object" && value !== null) {
      if (value.$in) {
        setFilterOperator("in");
        setFilterValue(Array.isArray(value.$in) ? value.$in.join(", ") : "");
      } else if (value.$gte && value.$lte) {
        setFilterOperator("between");
        setFilterValue(`${value.$gte}, ${value.$lte}`);
      }
    } else {
      setFilterOperator("equals");
      setFilterValue(String(value));
    }
  };

  const getFilterDisplayValue = (field: string, value: any): string => {
    if (field === "statusId" && filterOptions.statuses) {
      const status = filterOptions.statuses.find(s => s.id === Number(value));
      return status?.name || value;
    }
    if (field === "managementId" && filterOptions.managements) {
      const management = filterOptions.managements.find(m => m.id === Number(value));
      return management?.name || value;
    }
    if (field === "country" && filterOptions.countries) {
      return value;
    }
    if (field === "groupId" && filterOptions.groups) {
      const group = filterOptions.groups.find(g => g.id === Number(value));
      return group?.name || value;
    }
    return value;
  };

  const renderFilterDisplay = (filterCriteria: Record<string, any>): string => {
    if (!filterCriteria || Object.keys(filterCriteria).length === 0) {
      return "Sin filtro";
    }

    const field = Object.keys(filterCriteria)[0];
    const value = filterCriteria[field];

    if (typeof value === "object" && value !== null) {
      if (value.$in) {
        const values = Array.isArray(value.$in) 
          ? value.$in.map((v: any) => getFilterDisplayValue(field, v)).join(", ")
          : "";
        return `${field} en [${values}]`;
      }
      if (value.$gte && value.$lte) {
        return `${field} entre ${getFilterDisplayValue(field, value.$gte)} y ${getFilterDisplayValue(field, value.$lte)}`;
      }
    }

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
    filterOperator,
    setFilterOperator,
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
