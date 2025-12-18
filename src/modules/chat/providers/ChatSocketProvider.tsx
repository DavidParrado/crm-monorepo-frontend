import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { API_URL } from '@/lib/constants';
import type { Message } from '../types/chat.types';

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
 * Manages socket connection and shows toast notifications for new messages across the entire app
 */
export const ChatSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const { token, isSuperAdmin, isAuthenticated } = useAuthStore();
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

    // Global new message handler for notifications
    socketInstance.on('newMessage', (message: Message) => {
      // Check if user is currently on chat page with this conversation active
      const currentPath = window.location.pathname;
      const isOnChatPage = currentPath === '/chat';
      
      // Always invalidate contacts to update unread indicators
      queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });

      // Show toast notification only if NOT on chat page
      // (ChatWindow handles its own message display when on chat page)
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
  }, [token, isAuthenticated, isSuperAdmin, tenantId, queryClient]);

  return <>{children}</>;
};

// Export getter for socket instance (used by useChatSocket)
export const getGlobalSocket = () => socketInstance;
