import { SuperAdminUser } from "@/types/tenant";
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

interface DeleteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  member: SuperAdminUser | null;
  isDeleting: boolean;
}

export const DeleteMemberDialog = ({
  isOpen,
  onClose,
  onConfirm,
  member,
  isDeleting,
}: DeleteMemberDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-white border-slate-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-800">
            ¿Eliminar miembro?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600">
            Estás a punto de eliminar a{" "}
            <span className="font-semibold text-slate-800">
              {member?.firstName} {member?.lastName}
            </span>
            . Esta acción no se puede deshacer.
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
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
