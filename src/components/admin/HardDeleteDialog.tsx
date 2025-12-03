import { AlertTriangle } from "lucide-react";
import { Tenant } from "@/types/tenant";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HardDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tenant: Tenant | null;
  isDeleting: boolean;
}

export const HardDeleteDialog = ({
  isOpen,
  onClose,
  onConfirm,
  tenant,
  isDeleting,
}: HardDeleteDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-white border-slate-200">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-slate-800">
              ¿Eliminar permanentemente?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-slate-600 pt-2">
            <span className="block mb-2">
              Estás a punto de eliminar permanentemente el tenant{" "}
              <span className="font-semibold text-slate-800">
                {tenant?.name}
              </span>{" "}
              (<span className="font-mono text-sm">{tenant?.subdomain}</span>).
            </span>
            <span className="block p-3 bg-destructive/5 border border-destructive/20 rounded-md text-destructive font-medium">
              ⚠️ Esta acción eliminará PERMANENTEMENTE la base de datos y todos
              los datos asociados. Esta operación NO se puede deshacer.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
            disabled={isDeleting}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar Permanentemente'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
