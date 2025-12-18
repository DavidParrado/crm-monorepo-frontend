import { io, Socket } from 'socket.io-client';
import { http } from '@/lib/http';
import type { ChatUser, Conversation, Message, PaginatedResponse } from '../types/chat.types';

const API_URL = import.meta.env.VITE_API_URL || '';

// ============ HTTP Adapter ============

export const chatHttpAdapter = {
  getContacts: async (params: { page: number; limit: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    searchParams.set('page', params.page.toString());
    searchParams.set('limit', params.limit.toString());
    if (params.search) {
      searchParams.set('search', params.search);
    }
    return http.get<PaginatedResponse<ChatUser>>('chat/contacts', searchParams);
  },

  initConversation: async (targetUserId: number) => {
    return http.post<Conversation, { targetUserId: number }>('chat/init', { targetUserId });
  },

  getMessages: async (conversationId: number, params: { page: number; limit: number }) => {
    const searchParams = new URLSearchParams();
    searchParams.set('page', params.page.toString());
    searchParams.set('limit', params.limit.toString());
    return http.get<PaginatedResponse<Message>>(`chat/conversations/${conversationId}/messages`, searchParams);
  },
};

// ============ Socket Adapter ============

let socketInstance: Socket | null = null;

export const chatSocketAdapter = {
  connect: (token: string, tenantId: string): Socket => {
    if (socketInstance?.connected) {
      return socketInstance;
    }

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

    return socketInstance;
  },

  disconnect: () => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
  },

  getSocket: () => socketInstance,

  sendMessage: (conversationId: number, content: string) => {
    if (socketInstance?.connected) {
      socketInstance.emit('sendMessage', { conversationId, content });
    }
  },

  onNewMessage: (callback: (message: Message) => void) => {
    socketInstance?.on('newMessage', callback);
  },

  offNewMessage: (callback?: (message: Message) => void) => {
    if (callback) {
      socketInstance?.off('newMessage', callback);
    } else {
      socketInstance?.off('newMessage');
    }
  },
};
