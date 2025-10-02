export interface Note {
  id: string;
  content: string;
  management: { id: number; name: string; };
  user: { id: string; firstName: string; lastName?: string; };
  createdAt: string;
}
