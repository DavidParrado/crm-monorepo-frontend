import { useAuthStore } from "@/store/authStore";
import { RoleEnum } from "@/types/role";

/**
 * Hook to get memoized role-based booleans for the logged-in user.
 * This is the single source of truth for user permissions.
 */
export const useAuthRoles = () => {
  const { user } = useAuthStore();

  const role = user?.role?.name as RoleEnum;

  const isAdmin = role === RoleEnum.Admin;
  const isTeamLeader = role === RoleEnum.TeamLeader;
  const isAgent = role === RoleEnum.Agent;
  const isAuditor = role === RoleEnum.Auditor;

  return { user, role, isAdmin, isTeamLeader, isAgent, isAuditor };
};
