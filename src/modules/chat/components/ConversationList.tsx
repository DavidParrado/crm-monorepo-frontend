import { Search, Loader2, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatChatDate } from '@/lib/date-utils';
import { useOnlineStore } from '@/store/onlineStore';
import type { ConversationResponse } from '../types/chat.types';

interface ConversationListProps {
  conversations: ConversationResponse[];
  activeConversationId: number | null;
  searchQuery: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onSelectConversation: (conversation: ConversationResponse) => void;
  onNewChat: () => void;
}

export const ConversationList = ({
  conversations,
  activeConversationId,
  searchQuery,
  isLoading,
  onSearchChange,
  onSelectConversation,
  onNewChat,
}: ConversationListProps) => {
  const { isUserOnline } = useOnlineStore();

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const truncateText = (text: string, maxLength: number = 35) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Search and New Chat Button */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Chats</h2>
          <button
            onClick={onNewChat}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            title="Nuevo chat"
          >
            <span className="text-lg font-light">+</span>
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No se encontraron conversaciones' : 'No hay conversaciones activas'}
            </p>
            <button
              onClick={onNewChat}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Iniciar una nueva conversación
            </button>
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conversation) => {
              const isOnline = conversation.type === 'DIRECT' && conversation.contact
                ? isUserOnline(conversation.contact.id)
                : false;

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                    'hover:bg-accent/50',
                    activeConversationId === conversation.id && 'bg-accent/50'
                  )}
                >
                  {/* Avatar with online indicator */}
                  <div className="relative flex-shrink-0">
                    {conversation.type === 'GROUP' ? (
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                    ) : (
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                          {getInitials(conversation.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {/* Online indicator for DIRECT chats */}
                    {conversation.type === 'DIRECT' && isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">
                        {conversation.name}
                      </p>
                      {conversation.lastMessage && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatChatDate(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage
                          ? truncateText(conversation.lastMessage.content)
                          : 'Sin mensajes'}
                      </p>
                      {/* Unread badge */}
                      {conversation.unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="h-5 min-w-5 px-1.5 text-xs flex-shrink-0"
                        >
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
