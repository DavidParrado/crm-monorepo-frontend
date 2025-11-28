export type TenantStatus = 'ACTIVE' | 'SUSPENDED';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: TenantStatus;
  createdAt: string;
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

export interface SuperAdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface SuperAdminLoginResponse {
  access_token: string;
  user: SuperAdminUser;
}
