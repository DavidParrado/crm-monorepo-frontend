import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Message } from '../types/chat.types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => {
  const formattedTime = format(new Date(message.createdAt), 'HH:mm', { locale: es });

  return (
    <div className={cn('flex w-full', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] px-4 py-2 rounded-2xl',
          isOwn
            ? 'bg-primary text-primary-foreground rounded-tr-none'
            : 'bg-muted text-foreground rounded-tl-none'
        )}
      >
        {!isOwn && (
          <p className="text-xs font-medium mb-1 opacity-70">
            {message.sender.firstName} {message.sender.lastName}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={cn(
            'text-xs mt-1',
            isOwn ? 'text-primary-foreground/50' : 'text-muted-foreground/70'
          )}
        >
          {formattedTime}
        </p>
      </div>
    </div>
  );
};
