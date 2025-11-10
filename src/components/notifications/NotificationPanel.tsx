import { useNavigate, Link } from "react-router-dom";
import { useNotificationStore } from "@/store/notificationStore";
import { Button } from "@/components/ui/button";
import { CheckCheck, Clock, ArrowRight, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatNotification } from "@/utils/notificationFormatter";

interface NotificationPanelProps {
  onClose?: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const navigate = useNavigate();
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    markAllAsRead 
  } = useNotificationStore();

  // Las notificaciones ya se cargan en MainLayout, solo las mostramos aquí

  const handleNotificationClick = async (id: number, link: string | null) => {
    await markAsRead(id);
    onClose?.();
    if (link) {
      navigate(link);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[calc(100vh-200px)] lg:max-h-[600px]">
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <h3 className="font-semibold text-base">Notificaciones</h3>
        {notifications.some((n) => !n.isRead) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-xs h-8"
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No tienes notificaciones</p>
        </div>
      ) : (
        <>
          <div className="divide-y overflow-y-auto flex-1">
            {notifications.slice(0, 5).map((notification) => {
              const formatted = formatNotification(notification);
              
              const IconComponent = 
                formatted.icon === 'reminder' ? Clock :
                formatted.icon === 'success' ? CheckCircle :
                formatted.icon === 'warning' ? AlertCircle :
                Info;
              
              const iconBgColor = 
                formatted.icon === 'reminder' ? "bg-primary/10" :
                formatted.icon === 'success' ? "bg-success/10" :
                formatted.icon === 'warning' ? "bg-warning/10" :
                "bg-info/10";
              
              const iconColor = 
                formatted.icon === 'reminder' ? "text-primary" :
                formatted.icon === 'success' ? "text-success" :
                formatted.icon === 'warning' ? "text-warning" :
                "text-info";
              
              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.link)}
                  className={cn(
                    "w-full text-left p-4 hover:bg-accent/50 transition-colors",
                    !notification.isRead && "bg-accent/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-1 p-1.5 rounded-full", iconBgColor)}>
                      <IconComponent className={cn("h-4 w-4", iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium mb-1",
                        !notification.isRead && "font-semibold"
                      )}>
                        {formatted.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatted.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(notification.createdAt), "PPp", {
                          locale: es,
                        })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          {notifications.length > 0 && (
            <Link 
              to="/notifications" 
              className="block border-t bg-background"
              onClick={() => onClose?.()}
            >
              <button className="w-full p-4 text-sm font-medium hover:bg-accent/50 transition-colors flex items-center justify-center gap-2">
                Ver Todas las Notificaciones
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          )}
        </>
      )}
    </div>
  );
}

function Bell({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
