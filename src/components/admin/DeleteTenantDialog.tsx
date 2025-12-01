import { Loader2, AlertTriangle } from "lucide-react";
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

interface DeleteTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tenant: Tenant | null;
  isDeleting: boolean;
}

export const DeleteTenantDialog = ({
  isOpen,
  onClose,
  onConfirm,
  tenant,
  isDeleting,
}: DeleteTenantDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white border-slate-200">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-slate-900">
              Eliminar Tenant
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-slate-700 pt-2">
            ¿Estás seguro de que deseas eliminar el tenant{" "}
            <span className="font-medium text-slate-900">{tenant?.name}</span>?
            <br />
            <span className="text-destructive">
              Esta acción no se puede deshacer y eliminará todos los datos asociados.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="bg-transparent border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-slate-600"
            disabled={isDeleting}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
