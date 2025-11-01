import { Clock, CheckCircle, AlertCircle, Info, LucideIcon } from "lucide-react";

export type NotificationIconType = 'reminder' | 'success' | 'warning' | 'info';

interface NotificationIconStyles {
  IconComponent: LucideIcon;
  iconBgColor: string;
  iconColor: string;
}

/**
 * Hook to get icon component and styles based on notification type
 */
export const useNotificationIcon = (iconType: NotificationIconType): NotificationIconStyles => {
  const iconMap: Record<NotificationIconType, LucideIcon> = {
    reminder: Clock,
    success: CheckCircle,
    warning: AlertCircle,
    info: Info,
  };

  const bgColorMap: Record<NotificationIconType, string> = {
    reminder: "bg-primary/10",
    success: "bg-success/10",
    warning: "bg-warning/10",
    info: "bg-info/10",
  };

  const colorMap: Record<NotificationIconType, string> = {
    reminder: "text-primary",
    success: "text-success",
    warning: "text-warning",
    info: "text-info",
  };

  return {
    IconComponent: iconMap[iconType],
    iconBgColor: bgColorMap[iconType],
    iconColor: colorMap[iconType],
  };
};
