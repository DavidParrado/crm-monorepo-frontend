import { Status } from "./status";
import { Group } from "./group";
import { Management } from "./management";

export interface FilterOptions {
  countries?: string[];
  campaigns?: string[];
  statuses?: Status[];
  assignedUsers?: { id: number; name: string }[];
  groups?: Group[];
  managements?: Management[];
}
