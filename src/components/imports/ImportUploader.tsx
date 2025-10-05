import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { ImportPreview, ImportUploadResponse } from "@/types/import";
import { ColumnMapper } from "./ColumnMapper";
import { ImportResultFeedback } from "./ImportResultFeedback";

interface ImportUploaderProps {
  onSuccess?: () => void;
}

export const ImportUploader = ({ onSuccess }: ImportUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importResult, setImportResult] = useState<ImportUploadResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const token = useAuthStore((state) => state.token);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast({
          title: "Error",
          description: "Por favor selecciona un archivo CSV válido",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setPreview(null);
    }
  };

  const handlePreview = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_URL}/imports/parse-preview`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al analizar el archivo');
      }

      const data = await response.json();
      setPreview(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo analizar el archivo. Verifica el formato.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setImportResult(null);
  };

  const handleImportSuccess = (result: ImportUploadResponse) => {
    setImportResult(result);
    setPreview(null);
    onSuccess?.();
  };

  const handleCloseFeedback = () => {
    handleReset();
  };

  if (importResult) {
    return (
      <ImportResultFeedback
        result={importResult}
        onClose={handleCloseFeedback}
      />
    );
  }

  if (preview && selectedFile) {
    return (
      <ColumnMapper
        preview={preview}
        file={selectedFile}
        onCancel={handleReset}
        onSuccess={handleImportSuccess}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="flex-1"
        />
        {selectedFile && (
          <Button onClick={handlePreview} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Continuar
              </>
            )}
          </Button>
        )}
      </div>

      {selectedFile && (
        <div className="text-sm text-muted-foreground">
          Archivo seleccionado: {selectedFile.name}
        </div>
      )}

      <div className="bg-muted p-4 rounded-lg space-y-2">
        <h3 className="font-semibold text-sm">Instrucciones:</h3>
        <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
          <li>Selecciona un archivo CSV con los datos de tus clientes</li>
          <li>En el siguiente paso podrás mapear las columnas a los campos del sistema</li>
          <li>Los campos disponibles son: Nombre, Apellido, Email, Teléfono, País, TP y Campaña</li>
        </ul>
      </div>
    </div>
  );
};
