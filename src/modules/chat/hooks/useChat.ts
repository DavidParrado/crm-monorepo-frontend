import { useState, useCallback, useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { chatService } from '../services/chat.service';
import { useChatSocket } from './useChatSocket';
import type { ChatUser, ConversationResponse, CreateGroupDto } from '../types/chat.types';
import type { User } from '@/types/user';

const CONVERSATIONS_LIMIT = 20;
const CONTACTS_LIMIT = 20;
const MESSAGES_LIMIT = 30;

export const useChat = () => {
  const queryClient = useQueryClient();
  const { user, isSuperAdmin } = useAuthStore();

  const regularUser = !isSuperAdmin && user ? (user as User) : null;
  const currentUserId = regularUser?.id;
  const isAdmin = regularUser?.role?.name === 'Admin';

  const [activeConversation, setActiveConversation] = useState<ConversationResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);

  const { socketStatus, sendMessage } = useChatSocket(activeConversation?.id ?? null);

  // Conversations Query
  const conversationsQuery = useInfiniteQuery({
    queryKey: ['chat-conversations'],
    queryFn: async ({ pageParam = 1 }) => {
      return chatService.getConversations({ page: pageParam, limit: CONVERSATIONS_LIMIT });
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((acc, page) => acc + page.data.length, 0);
      return totalFetched < lastPage.total ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !isSuperAdmin,
  });

  // Contacts Query (for new chat dialog)
  const contactsQuery = useInfiniteQuery({
    queryKey: ['chat-contacts', contactSearchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      return chatService.getContacts({ page: pageParam, limit: CONTACTS_LIMIT, search: contactSearchQuery || undefined });
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((acc, page) => acc + page.data.length, 0);
      return totalFetched < lastPage.total ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !isSuperAdmin && isNewChatDialogOpen,
  });

  // Messages Query
  const messagesQuery = useInfiniteQuery({
    queryKey: ['chat-messages', activeConversation?.id],
    queryFn: async ({ pageParam = 1 }) => {
      if (!activeConversation?.id) throw new Error('No conversation selected');
      return chatService.getMessages(activeConversation.id, { page: pageParam, limit: MESSAGES_LIMIT });
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((acc, page) => acc + page.data.length, 0);
      return totalFetched < lastPage.total ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!activeConversation?.id,
  });

  // Init Conversation Mutation
  const initConversationMutation = useMutation({
    mutationFn: (targetUserId: number) => chatService.initConversation(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      setIsNewChatDialogOpen(false);
    },
    onError: () => toast.error('Error al iniciar conversación'),
  });

  // Create Group Mutation
  const createGroupMutation = useMutation({
    mutationFn: (data: CreateGroupDto) => chatService.createGroup(data),
    onSuccess: (newGroup) => {
      toast.success('Grupo creado');
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      setActiveConversation(newGroup);
      setIsNewChatDialogOpen(false);
    },
    onError: () => toast.error('Error al crear el grupo'),
  });

  // Delete Group Mutation
  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: number) => chatService.deleteGroup(groupId),
    onSuccess: () => {
      toast.success('Grupo eliminado');
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      setActiveConversation(null);
    },
    onError: () => toast.error('Error al eliminar el grupo'),
  });

  // Mark as Read
  const markAsReadMutation = useMutation({
    mutationFn: (conversationId: number) => chatService.markAsRead(conversationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chat-conversations'] }),
  });

  useEffect(() => {
    if (activeConversation?.id && activeConversation.unreadCount > 0) {
      markAsReadMutation.mutate(activeConversation.id);
    }
  }, [activeConversation?.id]);

  // Handlers
  const handleSelectConversation = useCallback((conversation: ConversationResponse) => {
    setActiveConversation(conversation);
  }, []);

  const handleSelectContact = useCallback((contact: ChatUser) => {
    initConversationMutation.mutate(contact.id);
  }, [initConversationMutation]);

  const handleCreateGroup = useCallback((name: string, participantIds: number[]) => {
    createGroupMutation.mutate({ name, participantIds });
  }, [createGroupMutation]);

  const handleDeleteGroup = useCallback((conversationId: number) => {
    deleteGroupMutation.mutate(conversationId);
  }, [deleteGroupMutation]);

  const handleSendMessage = useCallback((content: string) => {
    if (!activeConversation?.id || !content.trim()) return;
    sendMessage(activeConversation.id, content);
  }, [activeConversation?.id, sendMessage]);

  const handleBackToConversations = useCallback(() => setActiveConversation(null), []);
  const handleOpenNewChatDialog = useCallback(() => {
    setContactSearchQuery('');
    setIsNewChatDialogOpen(true);
  }, []);

  // Derived Data
  const conversations = conversationsQuery.data?.pages.flatMap((page) => page.data) || [];
  const contacts = contactsQuery.data?.pages.flatMap((page) => page.data) || [];
  const messages = messagesQuery.data?.pages.flatMap((page) => page.data).reverse() || [];

  const filteredConversations = searchQuery.trim()
    ? conversations.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  return {
    activeConversation, searchQuery, contactSearchQuery, socketStatus, currentUserId, isAdmin, isNewChatDialogOpen,
    conversations: filteredConversations, contacts, messages,
    isLoadingConversations: conversationsQuery.isLoading, isLoadingContacts: contactsQuery.isLoading,
    isLoadingMessages: messagesQuery.isLoading, isCreatingGroup: createGroupMutation.isPending,
    hasMoreConversations: conversationsQuery.hasNextPage, hasMoreMessages: messagesQuery.hasNextPage,
    fetchMoreConversations: conversationsQuery.fetchNextPage, fetchMoreMessages: messagesQuery.fetchNextPage,
    setSearchQuery, setContactSearchQuery, setIsNewChatDialogOpen,
    handleSelectConversation, handleSelectContact, handleCreateGroup, handleDeleteGroup,
    handleSendMessage, handleBackToConversations, handleOpenNewChatDialog,
  };
};
