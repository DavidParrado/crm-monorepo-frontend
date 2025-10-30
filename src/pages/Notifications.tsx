import { useState } from "react";
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
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
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
import { Bell, Trash2, Clock, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppNotification } from "@/types/notification";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatNotification, getNotificationTypeLabel } from "@/utils/notificationFormatter";
import { useNotificationsPage } from "@/hooks/useNotificationsPage";

export default function Notifications() {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<number | null>(null);
  
  const {
    notifications,
    readNotifications,
    totalPages,
    loading,
    currentPage,
    handlePageChange,
    markAsReadAndUpdate,
    handleDelete,
    handleDeleteRead,
  } = useNotificationsPage();

  const handleNotificationClick = async (notification: AppNotification) => {
    await markAsReadAndUpdate(notification);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const confirmDelete = (id: number) => {
    setNotificationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (notificationToDelete) {
      await handleDelete(notificationToDelete);
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    }
  };
  
  const renderPaginationItems = () => {
    const items = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;
    
    // Primera página
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Elipsis inicial
    if (showEllipsisStart) {
      items.push(<PaginationEllipsis key="ellipsis-start" />);
    }
    
    // Páginas intermedias
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Elipsis final
    if (showEllipsisEnd) {
      items.push(<PaginationEllipsis key="ellipsis-end" />);
    }
    
    // Última página (si hay más de una página)
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona todas tus notificaciones
          </p>
        </div>
        <div className="flex gap-2">
          {readNotifications.length > 0 && (
            <Button
              variant="outline"
              onClick={handleDeleteRead}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Leídas
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Todas las Notificaciones
            {notifications.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {notifications.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No tienes notificaciones</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => {
                  const formatted = formatNotification(notification);
                  
                  const IconComponent = 
                    formatted.icon === 'reminder' ? Clock :
                    formatted.icon === 'success' ? CheckCircle :
                    formatted.icon === 'warning' ? AlertCircle :
                    Info;
                  
                  const iconBgColor = 
                    formatted.icon === 'reminder' ? "bg-primary/10" :
                    formatted.icon === 'success' ? "bg-success/10" :
                    formatted.icon === 'warning' ? "bg-warning/10" :
                    "bg-info/10";
                  
                  const iconColor = 
                    formatted.icon === 'reminder' ? "text-primary" :
                    formatted.icon === 'success' ? "text-success" :
                    formatted.icon === 'warning' ? "text-warning" :
                    "text-info";
                  
                  return (
                    <TableRow 
                      key={notification.id}
                      className={cn(
                        "cursor-pointer hover:bg-accent/50",
                        !notification.isRead && "bg-accent/30"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <TableCell>
                        <div className={cn("p-2 rounded-full w-fit", iconBgColor)}>
                          <IconComponent className={cn("h-4 w-4", iconColor)} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className={cn(
                            "text-sm font-medium",
                            !notification.isRead && "font-semibold"
                          )}>
                            {formatted.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatted.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getNotificationTypeLabel(notification.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(notification.createdAt), "PPp", {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell>
                        {!notification.isRead ? (
                          <Badge variant="default">No leída</Badge>
                        ) : (
                          <Badge variant="outline">Leída</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(notification.id);
                          }}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {totalPages > 1 && notifications.length > 0 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {renderPaginationItems()}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar notificación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La notificación será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
