import { ChatwootInfo } from "@/types/kanban";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Clock, CheckCircle } from "lucide-react";

interface ChatStatusIndicatorProps {
  chatwootInfo: ChatwootInfo;
}

export const ChatStatusIndicator = ({ chatwootInfo }: ChatStatusIndicatorProps) => {
  const { conversationStatus, unreadCount } = chatwootInfo;

  // Show unread count badge if there are unread messages
  if (unreadCount > 0) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <MessageCircle className="h-3 w-3" />
        {unreadCount}
      </Badge>
    );
  }

  // Show status icon based on conversation status
  switch (conversationStatus) {
    case 'open':
      return (
        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <MessageCircle className="h-4 w-4" />
          <span className="text-xs">Open</span>
        </div>
      );
    case 'pending':
      return (
        <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
          <Clock className="h-4 w-4" />
          <span className="text-xs">Pending</span>
        </div>
      );
    case 'resolved':
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <CheckCircle className="h-4 w-4" />
          <span className="text-xs">Resolved</span>
        </div>
      );
    case 'none':
    default:
      return null;
  }
};
