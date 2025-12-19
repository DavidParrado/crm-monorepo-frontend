// Chat User
export interface ChatUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: { id: number; name: string };
  ext?: string;
  hasUnread?: boolean;
}

// Conversation Types
export type ConversationType = 'DIRECT' | 'GROUP';

// Legacy Conversation (for initConversation response)
export interface Conversation {
  id: number;
  type: ConversationType;
  updatedAt: string;
  name?: string | null;
}

// Participant Response
export interface ParticipantResponse {
  id: number;
  firstName: string;
  lastName: string;
  avatar?: string;
  isOnline?: boolean;
}

// Last Message Response
export interface LastMessageResponse {
  content: string;
  createdAt: string;
  senderId: number;
  isRead: boolean;
}

// Response from GET /chat/conversations
export interface ConversationResponse {
  id: number;
  type: ConversationType;
  name: string; // Pre-resolved name (Group Name or Contact Name)
  updatedAt: string; // ISO String
  unreadCount: number;
  lastMessage: LastMessageResponse | null;
  // Present only if type === 'DIRECT'
  contact?: ParticipantResponse | null;
  // Present only if type === 'GROUP'
  participants?: ParticipantResponse[];
}

// Payload for POST /chat/groups
export interface CreateGroupDto {
  name: string;
  participantIds: number[];
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

// User status changed payload
export interface UserStatusPayload {
  userId: number;
  isOnline: boolean;
}
