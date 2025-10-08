export interface Role {
  id: number;
  name: string;
}

export enum RoleEnum {
  Admin = 'Admin',
  AgenteFTD = 'AgenteFTD',
  AgenteRete = 'AgenteRete',
  TeamLeaderFTD = 'TeamLeaderFTD',
  TeamLeaderRete = 'TeamLeaderRete',
  Auditor = 'Auditor',
}
