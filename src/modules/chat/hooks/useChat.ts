import { useState, useEffect, useCallback, useRef } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { chatService } from '../services/chat.service';
import { chatSocketAdapter } from '../adapters/chat.adapter';
import type { Message, ChatUser, Conversation, SocketStatus } from '../types/chat.types';
import type { User } from '@/types/user';

const CONTACTS_LIMIT = 20;
const MESSAGES_LIMIT = 30;

// Helper to get tenant subdomain from URL or localStorage
const getTenantSubdomain = (): string => {
  // Try to get from current hostname (subdomain.domain.com)
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length > 2) {
    return parts[0];
  }
  // Fallback to localStorage or default
  return localStorage.getItem('tenant_subdomain') || 'default';
};

export const useChat = () => {
  const queryClient = useQueryClient();
  const { token, user, isSuperAdmin } = useAuthStore();
  const tenantId = getTenantSubdomain();
  
  // Type guard to get regular user ID
  const currentUserId = !isSuperAdmin && user ? (user as User).id : undefined;

  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [activeContact, setActiveContact] = useState<ChatUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [socketStatus, setSocketStatus] = useState<SocketStatus>('disconnected');
  
  const messageListenerRef = useRef<((message: Message) => void) | null>(null);

  // ============ Socket Connection ============
  useEffect(() => {
    if (!token || !tenantId || isSuperAdmin) return;

    setSocketStatus('connecting');
    const socket = chatSocketAdapter.connect(token, tenantId);

    socket.on('connect', () => {
      setSocketStatus('connected');
      console.log('Chat socket connected');
    });

    socket.on('disconnect', () => {
      setSocketStatus('disconnected');
      console.log('Chat socket disconnected');
    });

    socket.on('connect_error', (error) => {
      setSocketStatus('disconnected');
      console.error('Socket connection error:', error);
    });

    return () => {
      chatSocketAdapter.disconnect();
    };
  }, [token, tenantId, isSuperAdmin]);

  // ============ Socket Message Listener ============
  useEffect(() => {
    if (socketStatus !== 'connected') return;

    const handleNewMessage = (message: Message) => {
      if (message.conversationId === activeConversationId) {
        // Add message to active conversation cache
        queryClient.setQueryData(
          ['chat-messages', activeConversationId],
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
      } else {
        // Show toast notification for other conversations
        toast.info(`${message.sender.firstName} ${message.sender.lastName}`, {
          description: message.content.slice(0, 50) + (message.content.length > 50 ? '...' : ''),
        });
      }

      // Invalidate contacts to update order/unread
      queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
    };

    messageListenerRef.current = handleNewMessage;
    chatSocketAdapter.onNewMessage(handleNewMessage);

    return () => {
      if (messageListenerRef.current) {
        chatSocketAdapter.offNewMessage(messageListenerRef.current);
      }
    };
  }, [socketStatus, activeConversationId, queryClient]);

  // ============ Contacts Query ============
  const contactsQuery = useInfiniteQuery({
    queryKey: ['chat-contacts', searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      return chatService.getContacts({
        page: pageParam,
        limit: CONTACTS_LIMIT,
        search: searchQuery || undefined,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((acc, page) => acc + page.data.length, 0);
      return totalFetched < lastPage.total ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !isSuperAdmin,
  });

  // ============ Messages Query ============
  const messagesQuery = useInfiniteQuery({
    queryKey: ['chat-messages', activeConversationId],
    queryFn: async ({ pageParam = 1 }) => {
      if (!activeConversationId) throw new Error('No conversation selected');
      return chatService.getMessages(activeConversationId, {
        page: pageParam,
        limit: MESSAGES_LIMIT,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((acc, page) => acc + page.data.length, 0);
      return totalFetched < lastPage.total ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!activeConversationId,
  });

  // ============ Init Conversation Mutation ============
  const initConversationMutation = useMutation({
    mutationFn: (targetUserId: number) => chatService.initConversation(targetUserId),
    onSuccess: (conversation: Conversation) => {
      setActiveConversationId(conversation.id);
    },
    onError: (error) => {
      toast.error('Error al iniciar conversación');
      console.error('Init conversation error:', error);
    },
  });

  // ============ Handlers ============
  const handleSelectContact = useCallback((contact: ChatUser) => {
    setActiveContact(contact);
    initConversationMutation.mutate(contact.id);
  }, [initConversationMutation]);

  const handleSendMessage = useCallback((content: string) => {
    if (!activeConversationId || !content.trim()) return;
    chatSocketAdapter.sendMessage(activeConversationId, content.trim());
  }, [activeConversationId]);

  const handleBackToContacts = useCallback(() => {
    setActiveConversationId(null);
    setActiveContact(null);
  }, []);

  // ============ Derived Data ============
  const contacts = contactsQuery.data?.pages.flatMap((page) => page.data) || [];
  const messages = messagesQuery.data?.pages.flatMap((page) => page.data).reverse() || [];

  return {
    // State
    activeConversationId,
    activeContact,
    searchQuery,
    socketStatus,
    currentUserId,

    // Data
    contacts,
    messages,

    // Loading States
    isLoadingContacts: contactsQuery.isLoading,
    isLoadingMessages: messagesQuery.isLoading,
    isFetchingMoreContacts: contactsQuery.isFetchingNextPage,
    isFetchingMoreMessages: messagesQuery.isFetchingNextPage,
    isInitializingConversation: initConversationMutation.isPending,

    // Pagination
    hasMoreContacts: contactsQuery.hasNextPage,
    hasMoreMessages: messagesQuery.hasNextPage,
    fetchMoreContacts: contactsQuery.fetchNextPage,
    fetchMoreMessages: messagesQuery.fetchNextPage,

    // Actions
    setSearchQuery,
    handleSelectContact,
    handleSendMessage,
    handleBackToContacts,
  };
};
