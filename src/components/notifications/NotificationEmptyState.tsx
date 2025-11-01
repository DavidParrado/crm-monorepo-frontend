import { Bell } from "lucide-react";

export function NotificationEmptyState() {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
      <p>No tienes notificaciones</p>
    </div>
  );
}
