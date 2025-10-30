import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2 } from "lucide-react";
import { ColumnMapper } from "./ColumnMapper";
import { ImportResultFeedback } from "./ImportResultFeedback";
import { useImportUploader } from "@/hooks/useImportUploader";

interface ImportUploaderProps {
  onSuccess?: () => void;
}

export const ImportUploader = ({ onSuccess }: ImportUploaderProps) => {
  const {
    selectedFile,
    preview,
    importResult,
    isLoading,
    handleFileSelect,
    handlePreview,
    handleReset,
    handleImportSuccess,
    handleCloseFeedback,
  } = useImportUploader({ onSuccess });

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
