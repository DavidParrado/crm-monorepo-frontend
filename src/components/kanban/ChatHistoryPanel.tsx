import { ChatMessage as ChatMessageType } from "@/types/kanban";
import { ChatMessage } from "./ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle } from "lucide-react";

interface ChatHistoryPanelProps {
  history: ChatMessageType[];
}

export const ChatHistoryPanel = ({ history }: ChatHistoryPanelProps) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
        <MessageCircle className="h-12 w-12 opacity-50" />
        <p className="text-sm">No chat history available</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-4 py-4">
        {history.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
    </ScrollArea>
  );
};
