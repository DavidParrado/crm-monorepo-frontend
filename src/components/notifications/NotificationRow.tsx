import { AppNotification } from "@/types/notification";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Clock, CheckCircle, AlertCircle, Info, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatNotification, getNotificationTypeLabel } from "@/utils/notificationFormatter";

interface NotificationRowProps {
  notification: AppNotification;
  onClick: (notification: AppNotification) => void;
  onDelete: (id: number) => void;
  disabled?: boolean;
}

export function NotificationRow({ notification, onClick, onDelete, disabled }: NotificationRowProps) {
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
    <TableRow 
      className={cn(
        "cursor-pointer hover:bg-accent/50",
        !notification.isRead && "bg-accent/30"
      )}
      onClick={() => onClick(notification)}
    >
      <TableCell>
        <div className={cn("p-2 rounded-full w-fit", iconBgColor)}>
          <IconComponent className={cn("h-4 w-4", iconColor)} />
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className={cn(
            "text-sm font-medium",
            !notification.isRead && "font-semibold"
          )}>
            {formatted.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatted.description}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">
          {getNotificationTypeLabel(notification.type)}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">
        {format(new Date(notification.createdAt), "PPp", {
          locale: es,
        })}
      </TableCell>
      <TableCell>
        {!notification.isRead ? (
          <Badge variant="default">No leída</Badge>
        ) : (
          <Badge variant="outline">Leída</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          disabled={disabled}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
