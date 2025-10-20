import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Bell, Trash2, CheckCheck, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { Notification } from "@/types/notification";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { API_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Notifications() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { toast } = useToast();
  const { notifications, fetchNotifications } = useNotificationStore();
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (token) {
      fetchNotifications(token);
    }
  }, [token]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead && token) {
      try {
        await fetch(`${API_URL}/notifications/${notification.id}/read`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        fetchNotifications(token);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al eliminar notificación');

      toast({
        title: "Notificación eliminada",
        description: "La notificación ha sido eliminada exitosamente",
      });

      fetchNotifications(token);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la notificación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    }
  };

  const handleDeleteReadNotifications = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/notifications/read`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al eliminar notificaciones leídas');

      toast({
        title: "Notificaciones eliminadas",
        description: "Todas las notificaciones leídas han sido eliminadas",
      });

      fetchNotifications(token);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron eliminar las notificaciones leídas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: number) => {
    setNotificationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const readNotifications = notifications.filter(n => n.isRead);
  const unreadNotifications = notifications.filter(n => !n.isRead);

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
              onClick={handleDeleteReadNotifications}
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
                {notifications.map((notification) => (
                  <TableRow 
                    key={notification.id}
                    className={cn(
                      "cursor-pointer hover:bg-accent/50",
                      !notification.isRead && "bg-accent/30"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <TableCell>
                      <div className={cn(
                        "p-2 rounded-full w-fit",
                        notification.type === 'REMINDER' ? "bg-primary/10" : "bg-success/10"
                      )}>
                        {notification.type === 'REMINDER' ? (
                          <Clock className="h-4 w-4 text-primary" />
                        ) : (
                          <Bell className="h-4 w-4 text-success" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={cn(
                      !notification.isRead && "font-medium"
                    )}>
                      {notification.message}
                    </TableCell>
                    <TableCell>
                      <Badge variant={notification.type === 'REMINDER' ? 'default' : 'secondary'}>
                        {notification.type === 'REMINDER' ? 'Recordatorio' : 'Transaccional'}
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
            <AlertDialogAction
              onClick={() => notificationToDelete && handleDeleteNotification(notificationToDelete)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
