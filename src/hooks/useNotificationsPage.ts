import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AppNotification } from "@/types/notification";
import * as notificationService from "@/services/notificationService";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 12;

export const useNotificationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
      const data = await notificationService.getNotifications(params);
      setNotifications(data.data);
      setTotalCount(data.total);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error("No se pudieron cargar las notificaciones");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const markAsReadAndUpdate = async (notification: AppNotification) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
        toast.error("Error al marcar como leída");
      }
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await notificationService.deleteNotification(id);
      toast.success("Notificación eliminada");
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error("No se pudo eliminar la notificación");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRead = async () => {
    setLoading(true);
    try {
      await notificationService.deleteReadNotifications();
      toast.success("Notificaciones leídas eliminadas");
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      toast.error("No se pudieron eliminar las notificaciones leídas");
    } finally {
      setLoading(false);
    }
  };

  const readNotifications = notifications.filter(n => n.isRead);
  const unreadNotifications = notifications.filter(n => !n.isRead);

  return {
    notifications,
    readNotifications,
    unreadNotifications,
    totalCount,
    totalPages,
    loading,
    currentPage,
    handlePageChange,
    markAsReadAndUpdate,
    handleDelete,
    handleDeleteRead,
  };
};
