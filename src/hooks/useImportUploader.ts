import { useState, useCallback } from "react";
import { parsePreview } from "@/services/importService";
import { ImportPreview, ImportUploadResponse } from "@/types/import";
import { toast } from "sonner";

interface UseImportUploaderProps {
  onSuccess?: () => void;
}

export const useImportUploader = ({ onSuccess }: UseImportUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importResult, setImportResult] = useState<ImportUploadResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error("Por favor selecciona un archivo CSV válido");
        return;
      }
      setSelectedFile(file);
      setPreview(null);
    }
  }, []);

  const handlePreview = useCallback(async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const data = await parsePreview(formData);
      setPreview(data);
    } catch (error) {
      toast.error("No se pudo analizar el archivo. Verifica el formato.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    setImportResult(null);
  }, []);

  const handleImportSuccess = useCallback((result: ImportUploadResponse) => {
    setImportResult(result);
    setPreview(null);
    onSuccess?.();
  }, [onSuccess]);

  const handleCloseFeedback = useCallback(() => {
    handleReset();
  }, [handleReset]);

  return {
    selectedFile,
    preview,
    importResult,
    isLoading,
    handleFileSelect,
    handlePreview,
    handleReset,
    handleImportSuccess,
    handleCloseFeedback,
  };
};
