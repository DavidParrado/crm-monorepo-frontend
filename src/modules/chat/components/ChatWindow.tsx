import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, SendHorizontal, Loader2, WifiOff, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MessageBubble } from './MessageBubble';
import { useOnlineStore } from '@/store/onlineStore';
import type { Message, ConversationResponse, SocketStatus } from '../types/chat.types';

interface ChatWindowProps {
  conversation: ConversationResponse;
  messages: Message[];
  currentUserId: number | undefined;
  socketStatus: SocketStatus;
  isLoading: boolean;
  isAdmin: boolean;
  onSendMessage: (content: string) => void;
  onDeleteGroup: (conversationId: number) => void;
  onBack: () => void;
  onMarkAsRead: (conversationId: number) => void;
}

export const ChatWindow = ({
  conversation,
  messages,
  currentUserId,
  socketStatus,
  isLoading,
  isAdmin,
  onSendMessage,
  onDeleteGroup,
  onBack,
  onMarkAsRead,
}: ChatWindowProps) => {
  const [inputValue, setInputValue] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isUserOnline } = useOnlineStore();

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSend = () => {
    if (!inputValue.trim() || socketStatus !== 'connected') return;
    onSendMessage(inputValue);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Passive read trigger: mark as read when user focuses the input
  const handleInputFocus = () => {
    if (conversation.unreadCount > 0) {
      onMarkAsRead(conversation.id);
    }
  };

  // Smooth scroll to bottom when new messages arrive
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages]);

  // Scroll to bottom on initial load (instant)
  useEffect(() => {
    scrollToBottom('instant');
  }, []);

  // Calculate the index where "New Messages" separator should appear
  const newMessagesSeparatorIndex = useMemo(() => {
    if (!conversation.lastReadAt || conversation.unreadCount === 0) return -1;
    
    const lastReadDate = new Date(conversation.lastReadAt);
    
    // Find the first message that is:
    // 1. After lastReadAt
    // 2. NOT from the current user
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const messageDate = new Date(message.createdAt);
      
      if (messageDate > lastReadDate && message.senderId !== currentUserId) {
        return i;
      }
    }
    
    return -1;
  }, [messages, conversation.lastReadAt, conversation.unreadCount, currentUserId]);

  // Check if contact is online (for DIRECT chats)
  const isContactOnline = conversation.type === 'DIRECT' && conversation.contact
    ? isUserOnline(conversation.contact.id)
    : false;

  // Can delete group: only if it's a group AND user is admin
  const canDeleteGroup = conversation.type === 'GROUP' && isAdmin;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="md:hidden"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Avatar */}
        {conversation.type === 'GROUP' ? (
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
        ) : (
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {getInitials(conversation.name)}
              </AvatarFallback>
            </Avatar>
            {isContactOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
            )}
          </div>
        )}

        <div className="flex-1">
          <p className="font-semibold text-sm">{conversation.name}</p>
          {conversation.type === 'DIRECT' && (
            <p className="text-xs text-muted-foreground">
              {isContactOnline ? (
                <span className="text-green-500">En línea</span>
              ) : (
                'Desconectado'
              )}
            </p>
          )}
          {conversation.type === 'GROUP' && conversation.participants && (
            <p className="text-xs text-muted-foreground">
              {conversation.participants.length} participantes
            </p>
          )}
        </div>

        {/* Socket disconnected badge */}
        {socketStatus === 'disconnected' && (
          <Badge variant="destructive" className="gap-1">
            <WifiOff className="h-3 w-3" />
            Desconectado
          </Badge>
        )}

        {/* Delete group button (Admin only for groups) */}
        {canDeleteGroup && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar grupo?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará el grupo "{conversation.name}" y todo su historial de mensajes. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDeleteGroup(conversation.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Messages - Fixed height scrollable container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 min-h-0"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">
              No hay mensajes. ¡Envía el primero!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message, index) => (
              <div key={message.id}>
                {/* New Messages Separator */}
                {index === newMessagesSeparatorIndex && (
                  <div className="flex items-center gap-2 my-4">
                    <div className="flex-1 h-px bg-primary/30" />
                    <span className="text-xs font-medium text-primary px-2 py-1 bg-primary/10 rounded-full">
                      Mensajes Nuevos
                    </span>
                    <div className="flex-1 h-px bg-primary/30" />
                  </div>
                )}
                <MessageBubble
                  message={message}
                  isOwn={message.senderId === currentUserId}
                />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            placeholder="Escribe un mensaje..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            disabled={socketStatus !== 'connected'}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!inputValue.trim() || socketStatus !== 'connected'}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
