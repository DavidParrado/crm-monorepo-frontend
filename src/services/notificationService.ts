import { http } from "@/lib/http";
import { AppNotification } from "@/types/notification";
import { PaginatedResponse } from "@/types/api";

/**
 * Gets a paginated list of all notifications.
 * Used by Notifications page.
 */
export const getNotifications = (
  params: URLSearchParams
): Promise<PaginatedResponse<AppNotification>> => {
  return http.get<PaginatedResponse<AppNotification>>("notifications", params);
};

/**
 * Gets a non-paginated list of recent notifications.
 * Used by useNotificationStore for the panel.
 */
export const getRecentNotifications = (): Promise<{ data: AppNotification[] }> => {
  return http.get<{ data: AppNotification[] }>("notifications");
};

/**
 * Marks a single notification as read.
 */
export const markAsRead = (id: number): Promise<AppNotification> => {
  return http.patch<AppNotification, {}>(`notifications/${id}/read`, {});
};

/**
 * Marks all notifications as read.
 */
export const markAllAsRead = (): Promise<{ message: string }> => {
  return http.post<{ message: string }, {}>(`notifications/mark-all-as-read`, {});
};

/**
 * Deletes a single notification.
 */
export const deleteNotification = (id: number): Promise<void> => {
  return http.del<void>(`notifications/${id}`);
};

/**
 * Deletes all notifications that are marked as read.
 */
export const deleteReadNotifications = (): Promise<{ message: string }> => {
  return http.del<{ message: string }>(`notifications/read`);
};
