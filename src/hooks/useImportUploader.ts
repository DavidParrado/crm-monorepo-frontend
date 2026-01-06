import { useState, useCallback } from "react";
import { parsePreview } from "@/services/importService";
import { ImportPreview, ImportUploadResponse, ImportStatusResponse } from "@/types/import";
import { toast } from "sonner";

interface UseImportUploaderProps {
  onSuccess?: () => void;
}

export const useImportUploader = ({ onSuccess }: UseImportUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [activeImportId, setActiveImportId] = useState<number | null>(null);
  const [finalResult, setFinalResult] = useState<ImportStatusResponse | null>(null);
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
    setActiveImportId(null);
    setFinalResult(null);
  }, []);

  const handleUploadSuccess = useCallback((result: ImportUploadResponse) => {
    // Store the importId to start tracking progress
    setActiveImportId(result.importId);
    setPreview(null);
  }, []);

  const handleProgressComplete = useCallback((result: ImportStatusResponse) => {
    setFinalResult(result);
    setActiveImportId(null);
    onSuccess?.();
  }, [onSuccess]);

  const handleCloseFeedback = useCallback(() => {
    handleReset();
  }, [handleReset]);

  return {
    selectedFile,
    preview,
    activeImportId,
    finalResult,
    isLoading,
    handleFileSelect,
    handlePreview,
    handleReset,
    handleUploadSuccess,
    handleProgressComplete,
    handleCloseFeedback,
  };
};
