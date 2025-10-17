import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNotificationStore } from '@/store/notificationStore';
import { Notification } from '@/types/notification';
import { toast } from 'sonner';

const WS_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '').replace('http', 'ws') || 'ws://localhost:3001';

export const useNotificationWebSocket = (token: string | null) => {
  const socketRef = useRef<Socket | null>(null);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!token) {
      return;
    }

    console.log('Connecting to WebSocket server:', WS_URL);

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
      console.error('Connection error:', error);
    });

    // Escuchar evento de nuevas notificaciones
    socket.on('new_notification', (notification: Notification) => {
      console.log('🔔 New notification received:', notification);
      
      // Agregar al store
      addNotification(notification);
      
      // Mostrar toast
      toast(notification.message, {
        description: new Date(notification.createdAt).toLocaleString('es-ES', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
        duration: 5000,
      });
    });

    return () => {
      console.log('Cleaning up WebSocket connection');
      socket.disconnect();
    };
  }, [token, addNotification]);

  return socketRef.current;
};
