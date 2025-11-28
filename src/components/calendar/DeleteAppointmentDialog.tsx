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
import { useToast } from "@/hooks/use-toast";
import { Appointment } from "@/types/appointment";
import { deleteAppointment } from "@/services/appointmentService";

interface DeleteAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onSuccess: () => void;
}

export default function DeleteAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  onSuccess,
}: DeleteAppointmentDialogProps) {
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!appointment) return;

    try {
      await deleteAppointment(appointment.id);

      toast({
        title: "Éxito",
        description: "Cita eliminada correctamente",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la cita",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará la cita permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
