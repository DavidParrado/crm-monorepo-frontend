import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useOnlineStore } from '@/store/onlineStore';
import { API_URL } from '@/lib/constants';
import type { Message, UserStatusPayload } from '../types/chat.types';

// Singleton socket instance
let socketInstance: Socket | null = null;

// Helper to get tenant subdomain from URL or localStorage
const getTenantSubdomain = (): string => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length > 2) {
    return parts[0];
  }
  return localStorage.getItem('tenant_subdomain') || 'default';
};

/**
 * Global Chat Socket Provider
 * Manages socket connection, online status, and toast notifications for new messages
 */
export const ChatSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const { token, isSuperAdmin, isAuthenticated } = useAuthStore();
  const { setOnline, setOffline } = useOnlineStore();
  const tenantId = getTenantSubdomain();

  useEffect(() => {
    // Only connect for authenticated non-superadmin users
    if (!token || !isAuthenticated || isSuperAdmin) {
      return;
    }

    // Don't reconnect if already connected
    if (socketInstance?.connected) {
      return;
    }

    console.log('ChatSocketProvider: Connecting socket...');

    socketInstance = io(`${API_URL}/chat`, {
      auth: {
        token: `Bearer ${token}`,
      },
      query: {
        x_tenant_id: tenantId,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('ChatSocketProvider: Socket connected');
    });

    socketInstance.on('disconnect', () => {
      console.log('ChatSocketProvider: Socket disconnected');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('ChatSocketProvider: Socket connection error:', error);
    });

    // Handle user online status changes
    socketInstance.on('userStatusChanged', (payload: UserStatusPayload) => {
      if (payload.isOnline) {
        setOnline(payload.userId);
      } else {
        setOffline(payload.userId);
      }
    });

    // Global new message handler for notifications
    socketInstance.on('newMessage', (message: Message) => {
      // Check if user is currently on chat page
      const currentPath = window.location.pathname;
      const isOnChatPage = currentPath === '/chat';
      
      // Always invalidate conversations to update unread indicators and order
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });

      // Show toast notification only if NOT on chat page
      if (!isOnChatPage) {
        toast.info(`${message.sender.firstName} ${message.sender.lastName}`, {
          description: message.content.slice(0, 50) + (message.content.length > 50 ? '...' : ''),
        });
      }
    });

    return () => {
      if (socketInstance) {
        console.log('ChatSocketProvider: Disconnecting socket...');
        socketInstance.disconnect();
        socketInstance = null;
      }
    };
  }, [token, isAuthenticated, isSuperAdmin, tenantId, queryClient, setOnline, setOffline]);

  return <>{children}</>;
};

// Export getter for socket instance (used by useChatSocket)
export const getGlobalSocket = () => socketInstance;
