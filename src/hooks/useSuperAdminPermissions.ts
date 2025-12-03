import { useAuthStore } from "@/store/authStore";
import { SuperAdminUser, SuperAdminRole } from "@/types/tenant";

/**
 * Type guard to check if user is a SuperAdminUser.
 */
const isSuperAdminUser = (user: unknown): user is SuperAdminUser => {
  return user !== null && typeof user === 'object' && 'role' in user && 
    ['ROOT', 'ADMIN', 'SUPPORT'].includes((user as any).role);
};

/**
 * Hook to get role-based permissions for Super Admin users.
 */
export const useSuperAdminPermissions = () => {
  const { user } = useAuthStore();
  
  const superAdminUser = isSuperAdminUser(user) ? user : null;
  const role = superAdminUser?.role as SuperAdminRole | undefined;

  const isRoot = role === 'ROOT';
  const isAdmin = role === 'ADMIN';
  const isSupport = role === 'SUPPORT';

  // Permission checks
  const canHardDelete = isRoot; // Only ROOT can permanently delete
  const canManageTeam = isRoot || isAdmin; // ROOT and ADMIN can manage team
  const canEditTenants = isRoot || isAdmin; // ROOT and ADMIN can edit tenants
  const canSoftDelete = isRoot || isAdmin; // ROOT and ADMIN can soft delete
  const canRestore = isRoot || isAdmin; // ROOT and ADMIN can restore
  const canResetPassword = isRoot || isAdmin; // ROOT and ADMIN can reset passwords

  return {
    user: superAdminUser,
    role,
    isRoot,
    isAdmin,
    isSupport,
    canHardDelete,
    canManageTeam,
    canEditTenants,
    canSoftDelete,
    canRestore,
    canResetPassword,
  };
};
