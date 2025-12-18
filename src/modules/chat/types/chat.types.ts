// Chat User
export interface ChatUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: { id: number; name: string };
  ext?: string;
  hasUnread?: boolean; // Indicates unread messages in conversation
}

// Conversation
export interface Conversation {
  id: number;
  type: 'DIRECT' | 'GROUP';
  updatedAt: string;
  name?: string | null;
}

// Message
export interface Message {
  id: number;
  content: string;
  senderId: number;
  conversationId: number;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

// Notification Payload
export interface NewMessageNotificationPayload {
  preview: string;
  senderName: string;
  conversationId: number;
}

// Generic Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

// Socket connection status
export type SocketStatus = 'connected' | 'disconnected' | 'connecting';
