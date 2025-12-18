import { chatHttpAdapter } from '../adapters/chat.adapter';
import type { ChatUser, Conversation, Message, PaginatedResponse } from '../types/chat.types';

export const chatService = {
  getContacts: async (params: { page: number; limit: number; search?: string }): Promise<PaginatedResponse<ChatUser>> => {
    try {
      const response = await chatHttpAdapter.getContacts(params);
      return response;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  },

  initConversation: async (targetUserId: number): Promise<Conversation> => {
    try {
      const response = await chatHttpAdapter.initConversation(targetUserId);
      return response;
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
      const response = await chatHttpAdapter.getMessages(conversationId, params);
      return response;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },
};
