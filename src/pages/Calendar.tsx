import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CalendarView from "@/components/calendar/CalendarView";
import AppointmentModal from "@/components/calendar/AppointmentModal";
import DeleteAppointmentDialog from "@/components/calendar/DeleteAppointmentDialog";
import { useAppointments } from "@/hooks/useAppointments";
import { Appointment } from "@/types/appointment";

export default function Calendar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

  const {
    appointments,
    loading,
    totalPages,
    page,
    handlePageChange,
    refetchAppointments,
  } = useAppointments();

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleDelete = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setIsDeleteOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedAppointment(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus citas y recordatorios
          </p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Cita
        </Button>
      </div>

      <CalendarView
        appointments={appointments}
        loading={loading}
        totalPages={totalPages}
        page={page}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreateNew}
      />

      <AppointmentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        appointment={selectedAppointment}
        onSuccess={() => {
          refetchAppointments();
          setIsModalOpen(false);
        }}
      />

      <DeleteAppointmentDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        appointment={appointmentToDelete}
        onSuccess={() => {
          refetchAppointments();
          setIsDeleteOpen(false);
        }}
      />
    </div>
  );
}
