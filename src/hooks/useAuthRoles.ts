import { useAuthStore } from "@/store/authStore";
import { RoleEnum } from "@/types/role";
import { User } from "@/types/user";

/**
 * Type guard to check if the user is a regular CRM user (not SuperAdmin).
 */
const isCrmUser = (user: unknown): user is User => {
  return user !== null && typeof user === 'object' && 'role' in user;
};

/**
 * Hook to get memoized role-based booleans for the logged-in user.
 * This is the single source of truth for user permissions.
 */
export const useAuthRoles = () => {
  const { user: authUser } = useAuthStore();

  // Cast to User type for CRM pages (SuperAdmin won't access these)
  const user = isCrmUser(authUser) ? authUser : null;
  const role = user?.role?.name as RoleEnum | undefined;

  const isAdmin = role === RoleEnum.Admin;
  const isTeamLeader = role === RoleEnum.TeamLeader;
  const isAgent = role === RoleEnum.Agent;
  const isAuditor = role === RoleEnum.Auditor;

  return { user, role, isAdmin, isTeamLeader, isAgent, isAuditor };
};
