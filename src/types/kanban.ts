export interface KanbanClient {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface ChatwootInfo {
  conversationStatus: 'open' | 'pending' | 'resolved' | 'none';
  unreadCount: number;
  lastMessageTimestamp: string | null;
}

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  client: KanbanClient;
  chatwootInfo: ChatwootInfo;
  columnId: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  taskIds: string[];
}

export interface KanbanBoard {
  columns: Record<string, KanbanColumn>;
  tasks: Record<string, KanbanTask>;
  columnOrder: string[];
}

export interface ChatMessage {
  id: string;
  content: string;
  senderType: 'contact' | 'agent';
  timestamp: string;
}

export interface TaskDetail extends KanbanTask {
  chatHistory: ChatMessage[];
}

export interface ColumnPagination {
  [columnId: string]: {
    page: number;
    limit: number;
    total: number;
  };
}
