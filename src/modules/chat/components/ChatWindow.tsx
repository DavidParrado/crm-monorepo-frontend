import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, SendHorizontal, Loader2, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageBubble } from './MessageBubble';
import type { Message, ChatUser, SocketStatus } from '../types/chat.types';

interface ChatWindowProps {
  contact: ChatUser;
  messages: Message[];
  currentUserId: number | undefined;
  socketStatus: SocketStatus;
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  onBack: () => void;
}

export const ChatWindow = ({
  contact,
  messages,
  currentUserId,
  socketStatus,
  isLoading,
  onSendMessage,
  onBack,
}: ChatWindowProps) => {
  const [inputValue, setInputValue] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
            {getInitials(contact.firstName, contact.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-sm">
            {contact.firstName} {contact.lastName}
          </p>
          <Badge variant="outline" className="text-xs">
            {contact.role.name}
          </Badge>
        </div>
        {socketStatus === 'disconnected' && (
          <Badge variant="destructive" className="gap-1">
            <WifiOff className="h-3 w-3" />
            Desconectado
          </Badge>
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
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUserId}
              />
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
