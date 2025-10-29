import { Link } from "react-router-dom";
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
import { Appointment } from "@/types/appointment";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CalendarViewProps {
  appointments: Appointment[];
  loading: boolean;
  totalPages: number;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
  onCreate: () => void;
}

export default function CalendarView({
  appointments,
  loading,
  totalPages,
  page,
  onPageChange,
  onEdit,
  onDelete,
  onCreate,
}: CalendarViewProps) {

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
              <Button onClick={onCreate} className="mt-4">
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
                          new Date(appointment.appointmentDate) < new Date()
                            ? "secondary"
                            : "default"
                        }
                      >
                        {new Date(appointment.appointmentDate) < new Date()
                          ? "Pasada"
                          : "Pendiente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(appointment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(appointment)}
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
                      onClick={() => page > 1 && onPageChange(page - 1)}
                      className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => onPageChange(pageNum)}
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
                      onClick={() => page < totalPages && onPageChange(page + 1)}
                      className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
  );
}
