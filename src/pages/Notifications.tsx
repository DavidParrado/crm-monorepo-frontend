import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppNotification } from "@/types/notification";
import { useNotificationsPage } from "@/hooks/useNotificationsPage";
import { NotificationTable } from "@/components/notifications/NotificationTable";
import { DeleteNotificationDialog } from "@/components/notifications/DeleteNotificationDialog";
import { AppPagination } from "@/components/ui/app-pagination";

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
  

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona todas tus notificaciones
          </p>
        </div>
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

      <NotificationTable
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onDelete={confirmDelete}
        loading={loading}
      />
      
      {totalPages > 1 && notifications.length > 0 && (
        <AppPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <DeleteNotificationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
