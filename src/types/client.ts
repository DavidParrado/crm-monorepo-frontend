import { Group } from "./group";
import { Status } from "./status";
import { User } from "./user";

export interface Client {
  id: number;
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  country: string;
  tp?: string | null;
  campaign?: string | null;
  createdAt: Date;
  updatedAt: Date;
  assignedAt?: Date | null;
  statusId: number;
  status: Status | null;
  groupId: number;
  group: Group | null;
  assignedToUserId: number;
  assignedTo: User | null;
  lastManagementId?: number | null;
  importId?: number | null;
}

