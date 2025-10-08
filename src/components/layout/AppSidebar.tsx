import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Upload,
  Settings,
  LogOut,
  Building2,
  UserCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { capitalize } from "@/lib/utils";
import { RoleEnum } from "@/types/role";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: [RoleEnum.Admin, RoleEnum.TeamLeaderFTD, RoleEnum.TeamLeaderRete, RoleEnum.AgenteFTD, RoleEnum.AgenteRete, RoleEnum.Auditor] },
  { title: "Calendario", url: "/calendar", icon: Calendar, roles: [RoleEnum.Admin, RoleEnum.TeamLeaderFTD, RoleEnum.TeamLeaderRete, RoleEnum.AgenteFTD, RoleEnum.AgenteRete, RoleEnum.Auditor] },
  { title: "Mi Perfil", url: "/profile", icon: UserCircle, roles: [RoleEnum.Admin, RoleEnum.TeamLeaderFTD, RoleEnum.TeamLeaderRete, RoleEnum.AgenteFTD, RoleEnum.AgenteRete, RoleEnum.Auditor] },
];

const adminItems = [
  { title: "Usuarios", url: "/users", icon: Users, roles: [RoleEnum.Admin] },
  { title: "Importaciones", url: "/imports", icon: Upload, roles: [RoleEnum.Admin] },
  { title: "Configuración", url: "/settings", icon: Settings, roles: [RoleEnum.Admin] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, logout } = useAuthStore();
  const isCollapsed = state === "collapsed";

  const canAccessRoute = (routeRoles: string[]) => {
    console.log('User Role:', user?.role?.name);
    console.log('Route Roles:', routeRoles);
    if (!user || !user.role) return false;
    return user && routeRoles.includes(user.role.name);
  };

  const getInitials = () => {
    if (!user) return "U";
    return `${user.firstName[0]}${user.lastName[0] ?? ''}`.toUpperCase();
  };

  const getNavClass = (isActive: boolean) => {
    return isActive
      ? "bg-sidebar-accent text-sidebar-primary font-medium"
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground";
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <div className="rounded-lg bg-primary p-2">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-bold text-sidebar-foreground">CRM Pro</span>
            <span className="text-xs text-sidebar-foreground/60">Sistema de Gestión</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-2">
          <SidebarGroupLabel>
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.filter(item => canAccessRoute(item.roles)).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="group-data-[collapsible=icon]:justify-center">
                    <NavLink to={item.url} end className={({ isActive }) => getNavClass(isActive)}>
                      <item.icon className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.role.name === RoleEnum.Admin && (
          <SidebarGroup className="px-2">
            <SidebarGroupLabel>
              Administración
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="group-data-[collapsible=icon]:justify-center">
                      <NavLink to={item.url} className={({ isActive }) => getNavClass(isActive)}>
                        <item.icon className="h-4 w-4" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-4 py-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {capitalize(user?.firstName + ' ' + user?.lastName)}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user?.username}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:px-2"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 group-data-[collapsible=icon]:mr-0 mr-2" />
            <span className="group-data-[collapsible=icon]:hidden">Cerrar Sesión</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
