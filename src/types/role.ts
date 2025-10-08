export interface Role {
  id: number;
  name: string;
}

export enum RoleEnum {
  Admin = 'Admin',
  Agent = 'Agent',
  TeamLeader = 'TeamLeader',
  Auditor = 'Auditor',
}
