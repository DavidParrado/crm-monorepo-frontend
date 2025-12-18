import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getGlobalSocket } from '../providers/ChatSocketProvider';
import type { Message, SocketStatus } from '../types/chat.types';

export const useChatSocket = (activeConversationId: number | null = null) => {
  const queryClient = useQueryClient();
  const [socketStatus, setSocketStatus] = useState<SocketStatus>('disconnected');
  const activeConversationRef = useRef(activeConversationId);

  // Keep ref updated
  useEffect(() => {
    activeConversationRef.current = activeConversationId;
  }, [activeConversationId]);

  // Monitor socket connection status and handle active conversation messages
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

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Handle messages for active conversation (update cache immediately)
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

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('newMessage', handleNewMessage);
    };
  }, [queryClient, activeConversationId]);

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

  return {
    socketStatus,
    sendMessage,
  };
};
