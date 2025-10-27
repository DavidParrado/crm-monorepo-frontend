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
import { User } from "@/types/user";
import { RoleEnum } from "@/types/role";
import { format } from "date-fns";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";

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
  const { token, user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    userId: "",
    title: "",
    description: "",
    date: "",
    time: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isAdmin = user?.role?.name === RoleEnum.Admin;

  useEffect(() => {
    if (open) {
      if (isAdmin) {
        fetchUsers();
      }
      if (appointment) {
        // Parse UTC ISO string to local date and time for display
        const localDate = new Date(appointment.appointmentDate);
        setFormData({
          userId: appointment.userId?.toString(),
          title: appointment.title,
          description: appointment.description || "",
          date: format(localDate, "yyyy-MM-dd"),
          time: format(localDate, "HH:mm"),
        });
      } else {
        setFormData({
          userId: "",
          title: "",
          description: "",
          date: "",
          time: "",
        });
      }
    }
  }, [open, appointment, isAdmin]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al cargar usuarios");
      const data = await response.json();
      setUsers(data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.time) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    // Solo validar userId si es admin
    if (isAdmin && !appointment && !formData.userId) {
      toast({
        title: "Error",
        description: "Por favor selecciona un usuario",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Combine local date and time into a single Date object
      const localDateTime = new Date(`${formData.date}T${formData.time}`);

      // Convert to UTC ISO string for the API
      const appointmentDate = localDateTime.toISOString();

      const url = appointment
        ? `${API_URL}/appointments/${appointment.id}`
        : `${API_URL}/appointments`;

      const method = appointment ? "PATCH" : "POST";

      const body: CreateAppointmentData | UpdateAppointmentData = appointment
        ? {
          ...(isAdmin && formData.userId ? { userId: parseInt(formData.userId) } : {}),
          title: formData.title,
          description: formData.description || undefined,
          appointmentDate,
        }
        : {
          ...(isAdmin && formData.userId ? { userId: parseInt(formData.userId) } : {}),
          title: formData.title,
          description: formData.description || undefined,
          appointmentDate,
        };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
          {isAdmin && (
            <div>
              <Label htmlFor="user">Usuario {!appointment && '*'}</Label>
              <Select
                value={formData.userId}
                onValueChange={(value) =>
                  setFormData({ ...formData, userId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.firstName} {user?.lastName || ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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

            <div className="flex gap-2 w-full mt-3">
              <div className="flex-1">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="time">Hora *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </div>
            </div>
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
