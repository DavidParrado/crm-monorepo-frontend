export interface Management {
  id: number;
  name: string;
  groupId?: number | null;
  group?: {
    id: number;
    name: string;
  };
}