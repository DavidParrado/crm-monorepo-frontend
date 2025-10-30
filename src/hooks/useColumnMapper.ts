import { useState, useCallback } from "react";
import { uploadFile } from "@/services/importService";
import { ImportPreview, ImportMapping, ImportUploadResponse } from "@/types/import";
import { toast } from "sonner";

interface UseColumnMapperProps {
  preview: ImportPreview;
  file: File;
  onSuccess: (result: ImportUploadResponse) => void;
}

export const useColumnMapper = ({ preview, file, onSuccess }: UseColumnMapperProps) => {
  const [mapping, setMapping] = useState<ImportMapping>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMappingChange = useCallback((columnIndex: number, fieldName: string) => {
    setMapping(prev => ({
      ...prev,
      [columnIndex]: fieldName
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    // Validate at least one field is mapped (not ignore)
    const hasMapping = Object.values(mapping).some(field => field !== 'ignore');
    if (!hasMapping) {
      toast.error("Debes mapear al menos una columna");
      return;
    }

    // Validate email is mapped
    const hasEmail = Object.values(mapping).includes('email');
    if (!hasEmail) {
      toast.error("Debes mapear la columna de Email");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mapping', JSON.stringify(mapping));

      const result = await uploadFile(formData);

      toast.success(`${result.successful} registros exitosos, ${result.failed} fallidos`);
      onSuccess(result);
    } catch (error) {
      toast.error("No se pudo procesar la importación");
    } finally {
      setIsSubmitting(false);
    }
  }, [mapping, file, onSuccess]);

  return {
    mapping,
    isSubmitting,
    handleMappingChange,
    handleSubmit,
  };
};
