export interface CreateUserData {
  firstName: string;
  lastName?: string;
  username: string;
  password: string;
  roleId: number;
  groupId?: number | null;
  ext?: string | null;
  teamLeaderId?: number | null;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  username?: string;
  roleId?: number;
  groupId?: number | null;
  ext?: string | null;
  teamLeaderId?: number | null;
}
