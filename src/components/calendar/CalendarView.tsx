import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Calendar, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Appointment } from "@/types/appointment";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import AppointmentModal from "./AppointmentModal";
import DeleteAppointmentDialog from "./DeleteAppointmentDialog";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";

interface PaginatedResponse {
  data: Appointment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function CalendarView() {
  const { token } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "12", 10);

  useEffect(() => {
    fetchAppointments();
  }, [page, limit]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_URL}/appointments?page=${page}&limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al cargar citas");
      const data: PaginatedResponse = await response.json();
      console.log('Appointments Response:', data);
      setAppointments(data?.data || []);
      setTotalPages(data?.meta?.totalPages || 1);
      setTotal(data?.meta?.total || 0);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las citas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString(), limit: limit.toString() });
  };

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

  const isPastAppointment = (appointmentDate: string) => {
    return new Date(appointmentDate) < new Date();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="min-h-[500px] flex items-center justify-center">
          <div>Cargando citas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Citas Programadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay citas programadas</p>
              <Button onClick={handleCreateNew} className="mt-4">
                Crear primera cita
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      {appointment?.userName || `Usuario #${appointment?.userId}`}
                    </TableCell>
                    <TableCell>
                      <Link 
                        to={`/appointments/${appointment.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {appointment.title}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {appointment.description || "-"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(appointment.appointmentDate), "PPp", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(appointment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(appointment)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => page > 1 && handlePageChange(page - 1)}
                      className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNum)}
                            isActive={pageNum === page}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (pageNum === page - 2 || pageNum === page + 2) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => page < totalPages && handlePageChange(page + 1)}
                      className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <AppointmentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        appointment={selectedAppointment}
        onSuccess={fetchAppointments}
      />

      <DeleteAppointmentDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        appointment={appointmentToDelete}
        onSuccess={fetchAppointments}
      />
    </>
  );
}
