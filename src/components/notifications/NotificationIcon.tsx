import { useNotificationIcon, NotificationIconType } from "@/hooks/useNotificationIcon";
import { cn } from "@/lib/utils";

interface NotificationIconProps {
  iconType: NotificationIconType;
}

export function NotificationIcon({ iconType }: NotificationIconProps) {
  const { IconComponent, iconBgColor, iconColor } = useNotificationIcon(iconType);

  return (
    <div className={cn("p-2 rounded-full w-fit", iconBgColor)}>
      <IconComponent className={cn("h-4 w-4", iconColor)} />
    </div>
  );
}
