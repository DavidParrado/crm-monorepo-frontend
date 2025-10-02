import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { ColumnMappingModal } from "./ColumnMappingModal";
import type { ImportUploadResponse } from "@/types/import";

interface ImportUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ImportUploadModal({ open, onOpenChange, onSuccess }: ImportUploadModalProps) {
  const { token } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState<ImportUploadResponse | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Error",
          description: "Solo se permiten archivos CSV",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/imports/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Error al subir archivo');

      const data = await response.json() as ImportUploadResponse;
      setUploadResponse(data);
      
      toast({
        title: "Archivo cargado",
        description: "Ahora mapea las columnas del CSV",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo subir el archivo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setUploadResponse(null);
    onOpenChange(false);
  };

  const handleMappingSuccess = () => {
    handleClose();
    onSuccess();
  };

  return (
    <>
      <Dialog open={open && !uploadResponse} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cargar archivo CSV</DialogTitle>
            <DialogDescription>
              Selecciona un archivo CSV con los datos de los clientes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">Archivo CSV</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Archivo seleccionado: {file.name}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleUpload} disabled={!file || isUploading}>
                {isUploading ? "Subiendo..." : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {uploadResponse && (
        <ColumnMappingModal
          open={!!uploadResponse}
          onOpenChange={(open) => {
            if (!open) handleClose();
          }}
          importId={uploadResponse.id}
          headers={uploadResponse.headers}
          onSuccess={handleMappingSuccess}
        />
      )}
    </>
  );
}
