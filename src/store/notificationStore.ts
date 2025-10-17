import { create } from 'zustand';
import { Notification } from '@/types/notification';
import { API_URL } from '@/lib/constants';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  addNotification: (notification: Notification) => void;
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: number, token: string) => Promise<void>;
  markAllAsRead: (token: string) => Promise<void>;
  fetchNotifications: (token: string) => Promise<void>;
  updateUnreadCount: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }));
    get().updateUnreadCount();
  },

  setNotifications: (notifications) => {
    set({ notifications });
    get().updateUnreadCount();
  },

  updateUnreadCount: () => {
    const { notifications } = get();
    const count = notifications.filter((n) => !n.isRead).length;
    set({ unreadCount: count });
  },

  fetchNotifications: async (token) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener notificaciones');
      }

      const data = await response.json();
      get().setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id, token) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al marcar notificación como leída');
      }

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
      }));
      get().updateUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async (token) => {
    try {
      const response = await fetch(`${API_URL}/notifications/mark-all-as-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al marcar todas como leídas');
      }

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  },
}));
