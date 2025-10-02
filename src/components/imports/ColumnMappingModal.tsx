import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/hooks/use-toast";
import type { ColumnMapping } from "@/types/import";

interface ColumnMappingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importId: number;
  headers: string[];
  onSuccess: () => void;
}

const crmFields = [
  { value: "firstName", label: "Nombre" },
  { value: "lastName", label: "Apellido" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Teléfono" },
  { value: "address", label: "Dirección" },
  { value: "city", label: "Ciudad" },
  { value: "state", label: "Estado/Provincia" },
  { value: "zipCode", label: "Código Postal" },
  { value: "country", label: "País" },
  { value: "company", label: "Empresa" },
  { value: "notes", label: "Notas" },
  { value: "skip", label: "Omitir columna" },
];

export function ColumnMappingModal({ open, onOpenChange, importId, headers, onSuccess }: ColumnMappingModalProps) {
  const { token } = useAuthStore();
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMappingChange = (csvColumn: string, crmField: string) => {
    setMappings(prev => ({
      ...prev,
      [csvColumn]: crmField,
    }));
  };

  const handleProcess = async () => {
    const columnMappings: ColumnMapping[] = Object.entries(mappings)
      .filter(([_, crmField]) => crmField !== "skip")
      .map(([csvColumn, crmField]) => ({ csvColumn, crmField }));

    if (columnMappings.length === 0) {
      toast({
        title: "Error",
        description: "Debes mapear al menos una columna",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`${API_URL}/imports/${importId}/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ columnMappings }),
      });

      if (!response.ok) throw new Error('Error al procesar importación');

      toast({
        title: "Importación iniciada",
        description: "Los datos se están procesando en segundo plano",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la importación",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mapear columnas del CSV</DialogTitle>
          <DialogDescription>
            Relaciona cada columna del CSV con los campos del CRM
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {headers.map((header) => (
            <div key={header} className="grid grid-cols-2 gap-4 items-center">
              <div>
                <Label className="font-mono text-sm">{header}</Label>
              </div>
              <Select
                value={mappings[header] || ""}
                onValueChange={(value) => handleMappingChange(header, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar campo..." />
                </SelectTrigger>
                <SelectContent>
                  {crmFields.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleProcess} disabled={isProcessing}>
              {isProcessing ? "Procesando..." : "Procesar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
