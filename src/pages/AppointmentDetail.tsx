import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Edit, Trash2, ArrowLeft, User, Clock, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Appointment } from "@/types/appointment";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import AppointmentModal from "@/components/calendar/AppointmentModal";
import DeleteAppointmentDialog from "@/components/calendar/DeleteAppointmentDialog";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";

export default function AppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchAppointment();
    }
  }, [id]);

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al cargar la cita");
      const data = await response.json();
      setAppointment(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la cita",
        variant: "destructive",
      });
      navigate("/calendar");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteOpen(true);
  };

  const handleDeleteSuccess = () => {
    toast({
      title: "Cita eliminada",
      description: "La cita ha sido eliminada exitosamente",
    });
    navigate("/calendar");
  };

  const isPastAppointment = (appointmentDate: string) => {
    return new Date(appointmentDate) < new Date();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardContent className="min-h-[400px] flex items-center justify-center">
            <div>Cargando cita...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardContent className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Cita no encontrada</p>
              <Button onClick={() => navigate("/calendar")}>
                Volver al Calendario
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/calendar")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detalle de Cita</h1>
            <p className="text-muted-foreground mt-1">
              Información completa de la cita
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Calendar className="h-6 w-6" />
                {appointment.title}
              </CardTitle>
              <Badge
                variant={
                  isPastAppointment(appointment.appointmentDate)
                    ? "secondary"
                    : "default"
                }
              >
                {isPastAppointment(appointment.appointmentDate)
                  ? "Pasada"
                  : "Pendiente"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Usuario Asignado</p>
                  <p className="text-base">
                    {appointment.userName || `Usuario #${appointment.userId}`}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha y Hora</p>
                  <p className="text-base">
                    {format(new Date(appointment.appointmentDate), "PPP", {
                      locale: es,
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(appointment.appointmentDate), "p", {
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                  <p className="text-base whitespace-pre-wrap">
                    {appointment.description || "Sin descripción"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <p className="text-muted-foreground">Creada el</p>
              <p>
                {format(new Date(appointment.createdAt), "PPp", {
                  locale: es,
                })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Última actualización</p>
              <p>
                {format(new Date(appointment.updatedAt), "PPp", {
                  locale: es,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AppointmentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        appointment={appointment}
        onSuccess={fetchAppointment}
      />

      <DeleteAppointmentDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        appointment={appointment}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
