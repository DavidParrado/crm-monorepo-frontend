import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { AppNotification } from '@/types/notification';
import * as notificationService from '@/services/notificationService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatNotification } from '@/utils/notificationFormatter';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  socket: Socket | null;
  addNotification: (notification: AppNotification) => void;
  setNotifications: (notifications: AppNotification[]) => void;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  updateUnreadCount: () => void;
  initWebSocket: (token: string) => void;
  disconnectWebSocket: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  socket: null,

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
      const notifications = data.data || [];
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

  disconnectWebSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
      console.log('🧹 WebSocket disconnected by store');
    }
  },

  initWebSocket: (token: string) => {
    // Prevent multiple connections
    if (get().socket) {
      console.log('⚠️ WebSocket already connected, skipping initialization');
      return;
    }

    const WS_URL = import.meta.env.VITE_WS_URL;
    if (!WS_URL) {
      console.error('❌ VITE_WS_URL environment variable is not set');
      return;
    }

    console.log('🔌 Connecting to WebSocket server:', WS_URL);

    // Use the correct 'auth' method for Socket.IO
    const socket = io(WS_URL, {
      auth: {
        token: `Bearer ${token}`
      }
    });

    set({ socket });

    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server with ID:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
      set({ socket: null });
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
    });

    // Listen for new notifications
    socket.on('new_notification', (notification: AppNotification) => {
      console.log('🔔 New notification received:', notification);

      // Add to store (this already updates the count)
      get().addNotification(notification);

      // Show toast
      const formatted = formatNotification(notification);
      const formattedDate = format(new Date(notification.createdAt), "PPp", { locale: es });

      toast(formatted.title, {
        description: `${formatted.description}\n${formattedDate}`,
        duration: 5000,
      });
    });
  },
}));
