export interface Notification {
  id: number;
  message: string;
  type: 'TRANSACTIONAL' | 'REMINDER';
  isRead: boolean;
  link: string | null;
  createdAt: string;
  recipientId: number;
}
