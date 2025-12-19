import { http } from '@/lib/http';
import type { 
  ChatUser, 
  Conversation, 
  ConversationResponse,
  CreateGroupDto,
  Message, 
  PaginatedResponse 
} from '../types/chat.types';

export const chatService = {
  // Get contacts for new chat search
  getContacts: async (params: { page: number; limit: number; search?: string }): Promise<PaginatedResponse<ChatUser>> => {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('page', params.page.toString());
      searchParams.set('limit', params.limit.toString());
      if (params.search) {
        searchParams.set('search', params.search);
      }
      return await http.get<PaginatedResponse<ChatUser>>('chat/contacts', searchParams);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  },

  // Get active conversations list
  getConversations: async (params: { page: number; limit: number }): Promise<PaginatedResponse<ConversationResponse>> => {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('page', params.page.toString());
      searchParams.set('limit', params.limit.toString());
      return await http.get<PaginatedResponse<ConversationResponse>>('chat/conversations', searchParams);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // Initialize or get existing conversation with a user
  initConversation: async (targetUserId: number): Promise<Conversation> => {
    try {
      return await http.post<Conversation, { targetUserId: number }>('chat/init', { targetUserId });
    } catch (error) {
      console.error('Error initializing conversation:', error);
      throw error;
    }
  },

  // Get messages for a conversation
  getMessages: async (
    conversationId: number,
    params: { page: number; limit: number }
  ): Promise<PaginatedResponse<Message>> => {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('page', params.page.toString());
      searchParams.set('limit', params.limit.toString());
      return await http.get<PaginatedResponse<Message>>(`chat/conversations/${conversationId}/messages`, searchParams);
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Create a new group
  createGroup: async (data: CreateGroupDto): Promise<ConversationResponse> => {
    try {
      return await http.post<ConversationResponse, CreateGroupDto>('chat/groups', data);
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  },

  // Delete a group
  deleteGroup: async (groupId: number): Promise<void> => {
    try {
      await http.del(`chat/groups/${groupId}`);
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  },

  // Mark conversation as read
  markAsRead: async (conversationId: number): Promise<void> => {
    try {
      await http.patch(`chat/conversations/${conversationId}/read`, {});
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  },
};
