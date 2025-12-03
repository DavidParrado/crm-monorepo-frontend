export type TenantStatus = 'ACTIVE' | 'SUSPENDED';
export type SuperAdminRole = 'ROOT' | 'ADMIN' | 'SUPPORT';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: TenantStatus;
  createdAt: string;
  deletedAt?: string | null;
}

export interface CreateTenantData {
  name: string;
  subdomain: string;
  username: string;
  password: string;
}

export interface UpdateTenantData {
  name?: string;
  status?: TenantStatus;
}

export interface TenantFilters {
  trashed?: boolean;
}

export interface SuperAdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: SuperAdminRole;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface SuperAdminLoginResponse {
  access_token: string;
  user: SuperAdminUser;
}

export interface CreateTeamMemberData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: SuperAdminRole;
}

export interface UpdateTeamMemberData {
  firstName?: string;
  lastName?: string;
  role?: SuperAdminRole;
  status?: 'ACTIVE' | 'INACTIVE';
}
