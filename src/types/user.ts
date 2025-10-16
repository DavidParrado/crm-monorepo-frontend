
export interface User {
  id: number;
  firstName: string;
  lastName?: string;
  username: string;
  ext?: string | null;
  createdAt: Date;
  updatedAt: Date;
  roleId: number;
  role: Role;
  groupId?: number | null;
  teamLeaderId?: number | null;
}

export interface Role {
  id: number;
  name: string;
}
