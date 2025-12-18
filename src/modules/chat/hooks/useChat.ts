import { useState, useCallback } from 'react';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { chatService } from '../services/chat.service';
import { useChatSocket } from './useChatSocket';
import type { ChatUser, Conversation } from '../types/chat.types';
import type { User } from '@/types/user';

const CONTACTS_LIMIT = 20;
const MESSAGES_LIMIT = 30;

export const useChat = () => {
  const { user, isSuperAdmin } = useAuthStore();
  
  // Type guard to get regular user ID
  const currentUserId = !isSuperAdmin && user ? (user as User).id : undefined;

  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [activeContact, setActiveContact] = useState<ChatUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Socket hook with active conversation context
  const { socketStatus, sendMessage } = useChatSocket(activeConversationId);

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
    sendMessage(activeConversationId, content);
  }, [activeConversationId, sendMessage]);

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
