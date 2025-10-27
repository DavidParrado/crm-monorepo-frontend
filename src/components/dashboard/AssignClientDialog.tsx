import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UserSelector } from "@/components/client/UserSelector";

interface AssignClientDialogProps {
  open: boolean;
  selectedCount: number;
  selectedAssigneeId: string;
  isProcessing: boolean;
  token: string | null;
  onOpenChange: (open: boolean) => void;
  onAssigneeChange: (value: string) => void;
  onConfirm: () => void;
}

export function AssignClientDialog({
  open,
  selectedCount,
  selectedAssigneeId,
  isProcessing,
  token,
  onOpenChange,
  onAssigneeChange,
  onConfirm,
}: AssignClientDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar Clientes</DialogTitle>
          <DialogDescription>
            Selecciona un usuario para asignar {selectedCount} cliente
            {selectedCount > 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="assignee">Usuario</Label>
            <UserSelector
              value={selectedAssigneeId}
              onValueChange={onAssigneeChange}
              token={token}
              disabled={isProcessing}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onAssigneeChange("");
            }}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={isProcessing || !selectedAssigneeId}>
            {isProcessing ? "Asignando..." : "Asignar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
