import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { getGlobalSocket } from '../providers/ChatSocketProvider';
import type { Message, SocketStatus, ConversationReadEvent } from '../types/chat.types';

export const useChatSocket = (activeConversationId: number | null = null) => {
  const queryClient = useQueryClient();
  const { user, isSuperAdmin } = useAuthStore();
  const [socketStatus, setSocketStatus] = useState<SocketStatus>('disconnected');
  const activeConversationRef = useRef(activeConversationId);

  // Get current user ID
  const currentUserId = !isSuperAdmin && user ? (user as { id: number }).id : null;

  // Keep ref updated
  useEffect(() => {
    activeConversationRef.current = activeConversationId;
  }, [activeConversationId]);

  // Monitor socket connection status and handle events
  useEffect(() => {
    const socket = getGlobalSocket();
    
    if (!socket) {
      setSocketStatus('disconnected');
      return;
    }

    // Update status based on socket state
    if (socket.connected) {
      setSocketStatus('connected');
    } else {
      setSocketStatus('disconnected');
    }

    const handleConnect = () => setSocketStatus('connected');
    const handleDisconnect = () => setSocketStatus('disconnected');

    // Handle new messages for active conversation (update cache immediately)
    const handleNewMessage = (message: Message) => {
      const currentActiveId = activeConversationRef.current;

      if (message.conversationId === currentActiveId) {
        // Add message to active conversation cache
        queryClient.setQueryData(
          ['chat-messages', currentActiveId],
          (oldData: any) => {
            if (!oldData) return oldData;
            const firstPage = oldData.pages[0];
            return {
              ...oldData,
              pages: [
                {
                  ...firstPage,
                  data: [message, ...firstPage.data],
                  total: firstPage.total + 1,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        );
      }
    };

    // Handle conversationRead event - update message read status (blue checks)
    const handleConversationRead = (event: ConversationReadEvent) => {
      const { conversationId, readByUserId } = event;
      
      // Only update if another user read my messages
      if (readByUserId === currentUserId) return;
      
      // Update messages cache to mark my messages as read
      queryClient.setQueryData(
        ['chat-messages', conversationId],
        (oldData: any) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((message: Message) => {
                // If this is my message, mark it as read
                if (message.senderId === currentUserId) {
                  return { ...message, isRead: true };
                }
                return message;
              }),
            })),
          };
        }
      );
      
      // Also invalidate conversations to update any UI indicators
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('newMessage', handleNewMessage);
    socket.on('conversationRead', handleConversationRead);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('newMessage', handleNewMessage);
      socket.off('conversationRead', handleConversationRead);
    };
  }, [queryClient, activeConversationId, currentUserId]);

  // Periodic check for socket connection
  useEffect(() => {
    const checkSocket = () => {
      const socket = getGlobalSocket();
      if (socket?.connected && socketStatus !== 'connected') {
        setSocketStatus('connected');
      } else if (!socket?.connected && socketStatus === 'connected') {
        setSocketStatus('disconnected');
      }
    };

    const interval = setInterval(checkSocket, 1000);
    return () => clearInterval(interval);
  }, [socketStatus]);

  // Send message
  const sendMessage = useCallback((conversationId: number, content: string) => {
    const socket = getGlobalSocket();
    if (socket?.connected && content.trim()) {
      socket.emit('sendMessage', { conversationId, content: content.trim() });
    }
  }, []);

  // Mark conversation as read via socket (fire-and-forget)
  const emitMarkAsRead = useCallback((conversationId: number) => {
    const socket = getGlobalSocket();
    if (socket?.connected) {
      socket.emit('markAsRead', conversationId);
      return true;
    }
    return false;
  }, []);

  return {
    socketStatus,
    sendMessage,
    emitMarkAsRead,
  };
};
