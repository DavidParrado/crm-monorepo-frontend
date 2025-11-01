import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Bell, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "@/store/notificationStore";
import * as notificationService from "@/services/notificationService";
import { AppNotification } from "@/types/notification";
import { NotificationIcon } from "./NotificationIcon";
import { formatNotification } from "@/utils/notificationFormatter";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const navigate = useNavigate();
  const { notifications, markAsRead } = useNotificationStore();

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.isRead) {
      await notificationService.markAsRead(notification.id);
      markAsRead(notification.id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
    
    onClose();
  };

  const handleViewAll = () => {
    navigate("/notifications");
    onClose();
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-sm">Notificaciones</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewAll}
          className="h-8 text-xs"
        >
          Ver todas
          <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        {recentNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Bell className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">No hay notificaciones</p>
          </div>
        ) : (
          <div className="divide-y">
            {recentNotifications.map((notification) => {
              const formatted = formatNotification(notification);
              
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-accent/50 cursor-pointer transition-colors",
                    !notification.isRead && "bg-accent/30"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <NotificationIcon iconType={formatted.icon} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm",
                        !notification.isRead && "font-semibold"
                      )}>
                        {formatted.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {formatted.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(notification.createdAt), "PPp", { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
