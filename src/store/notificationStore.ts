import { create } from 'zustand';
import { AppNotification } from '@/types/notification';
import * as notificationService from '@/services/notificationService';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  addNotification: (notification: AppNotification) => void;
  setNotifications: (notifications: AppNotification[]) => void;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
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

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const data = await notificationService.getRecentNotifications();
      console.log('📨 Fetched notifications from API:', data);
      const notifications = data.data || [];
      if (notifications.length > 0) {
        console.log('📅 First notification createdAt:', notifications[0].createdAt);
        console.log('📅 First notification as Date:', new Date(notifications[0].createdAt));
        console.log('📅 First notification ISO:', new Date(notifications[0].createdAt).toISOString());
        console.log('📅 First notification local:', new Date(notifications[0].createdAt).toLocaleString());
      }
      get().setNotifications(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationService.markAsRead(id);
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

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  },
}));
