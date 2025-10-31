import { ChatMessage as ChatMessageType } from "@/types/kanban";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isAgent = message.senderType === 'agent';
  const timestamp = format(new Date(message.timestamp), 'MMM d, HH:mm');

  return (
    <div className={cn("flex flex-col gap-1", isAgent ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isAgent 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-foreground"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
      </div>
      <span className="text-xs text-muted-foreground px-1">{timestamp}</span>
    </div>
  );
};
