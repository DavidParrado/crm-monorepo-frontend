import { http } from '@/lib/http';
import type { ChatUser, Conversation, Message, PaginatedResponse } from '../types/chat.types';

export const chatService = {
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

  initConversation: async (targetUserId: number): Promise<Conversation> => {
    try {
      return await http.post<Conversation, { targetUserId: number }>('chat/init', { targetUserId });
    } catch (error) {
      console.error('Error initializing conversation:', error);
      throw error;
    }
  },

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
};
