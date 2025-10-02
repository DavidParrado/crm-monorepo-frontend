import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Appointment, CreateAppointmentData, UpdateAppointmentData } from "@/types/appointment";
import { Client } from "@/types/client";
import { format } from "date-fns";

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment;
  onSuccess: () => void;
}

export default function AppointmentModal({
  open,
  onOpenChange,
  appointment,
  onSuccess,
}: AppointmentModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    clientId: "",
    title: "",
    description: "",
    appointmentDate: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchClients();
      if (appointment) {
        setFormData({
          clientId: appointment.clientId.toString(),
          title: appointment.title,
          description: appointment.description || "",
          appointmentDate: format(new Date(appointment.appointmentDate), "yyyy-MM-dd'T'HH:mm"),
        });
      } else {
        setFormData({
          clientId: "",
          title: "",
          description: "",
          appointmentDate: "",
        });
      }
    }
  }, [open, appointment]);

  const fetchClients = async () => {
    try {
      const response = await fetch("http://localhost:3000/clients?limit=1000");
      if (!response.ok) throw new Error("Error al cargar clientes");
      const data = await response.json();
      setClients(data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.clientId || !formData.title || !formData.appointmentDate) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const url = appointment
        ? `http://localhost:3000/appointments/${appointment.id}`
        : "http://localhost:3000/appointments";

      const method = appointment ? "PATCH" : "POST";

      const body: CreateAppointmentData | UpdateAppointmentData = appointment
        ? {
            title: formData.title,
            description: formData.description || undefined,
            appointmentDate: formData.appointmentDate,
          }
        : {
            clientId: parseInt(formData.clientId),
            title: formData.title,
            description: formData.description || undefined,
            appointmentDate: formData.appointmentDate,
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Error al guardar la cita");

      toast({
        title: "Éxito",
        description: appointment ? "Cita actualizada correctamente" : "Cita creada correctamente",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la cita",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Editar Cita" : "Nueva Cita"}
          </DialogTitle>
          <DialogDescription>
            {appointment
              ? "Modifica los detalles de la cita"
              : "Crea una nueva cita para un cliente"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="client">Cliente *</Label>
            <Select
              value={formData.clientId}
              onValueChange={(value) =>
                setFormData({ ...formData, clientId: value })
              }
              disabled={!!appointment}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.firstName} {client.lastName || ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Título de la cita"
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Detalles de la cita"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="appointmentDate">Fecha y Hora *</Label>
            <Input
              id="appointmentDate"
              type="datetime-local"
              value={formData.appointmentDate}
              onChange={(e) =>
                setFormData({ ...formData, appointmentDate: e.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Guardando..." : appointment ? "Guardar" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
