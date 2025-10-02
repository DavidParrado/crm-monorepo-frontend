
export interface User {
  id: number;
  firstName: string;
  lastName?: string;
  username: string;
  ext?: number | null;
  createdAt: Date;
  updatedAt: Date;
  roleId: number;
  role: Role;
  groupId?: number | null;
  teamLeaderId?: string | null;
}

export interface Role {
  id: number;
  name: string;
}
