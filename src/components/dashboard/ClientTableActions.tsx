import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientTableActionsProps {
  selectedCount: number;
  isProcessing: boolean;
  onAssign: () => void;
  onUnassign: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export function ClientTableActions({
  selectedCount,
  isProcessing,
  onAssign,
  onUnassign,
  onExport,
  onDelete,
}: ClientTableActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
      <span className="text-sm font-medium">
        {selectedCount} seleccionado{selectedCount > 1 ? "s" : ""}
      </span>
      <div className="flex gap-2 ml-auto">
        <Button 
          size="sm" 
          variant="outline"
          onClick={onAssign}
          disabled={isProcessing}
        >
          Asignar
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={onUnassign}
          disabled={isProcessing}
        >
          Desasignar
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={onExport}
          disabled={isProcessing}
        >
          Exportar
        </Button>
        <Button 
          size="sm" 
          variant="destructive"
          onClick={onDelete}
          disabled={isProcessing}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar
        </Button>
      </div>
    </div>
  );
}
