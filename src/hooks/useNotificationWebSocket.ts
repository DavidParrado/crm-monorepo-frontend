import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNotificationStore } from '@/store/notificationStore';
import { AppNotification } from '@/types/notification';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatNotification } from '@/utils/notificationFormatter';

const WS_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '').replace('http', 'ws') || 'ws://localhost:4000';

export const useNotificationWebSocket = (token: string | null) => {
  const socketRef = useRef<Socket | null>(null);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!token) {
      console.log('❌ No token available, WebSocket not connecting');
      return;
    }

    console.log('🔌 Connecting to WebSocket server:', WS_URL);
    console.log('🔑 Using token:', token?.substring(0, 20) + '...');

    // Establecer conexión con autenticación
    const socket = io(WS_URL, {
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server with ID:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });

    // Escuchar evento de nuevas notificaciones
    socket.on('new_notification', (notification: AppNotification) => {
      console.log('🔔 New notification received:', notification);
      
      // Agregar al store
      addNotification(notification);
      
      // Formatear y mostrar toast
      const formatted = formatNotification(notification);
      const formattedDate = format(new Date(notification.createdAt), "PPp", { locale: es });
      
      toast(formatted.title, {
        description: `${formatted.description}\n${formattedDate}`,
        duration: 5000,
      });
    });

    return () => {
      console.log('🧹 Cleaning up WebSocket connection');
      socket.disconnect();
    };
  }, [token, addNotification]);

  return socketRef.current;
};
