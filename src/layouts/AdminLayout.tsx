import { useEffect } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Building2, Shield, LogOut, Users, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adminNavItems = [
  {
    title: "Tenants",
    href: "/admin/tenants",
    icon: Building2,
  },
  {
    title: "Equipo",
    href: "/admin/team",
    icon: Users,
  },
  {
    title: "Integraciones",
    href: "/admin/integrations",
    icon: Server,
  },
];

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isSuperAdmin, logout, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !isSuperAdmin) {
      navigate("/admin/login", { replace: true });
    }
  }, [isAuthenticated, isSuperAdmin, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  if (!isAuthenticated || !isSuperAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex w-full bg-slate-950">
      {/* Admin Sidebar - Dark theme for distinction */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        {/* Header */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-800">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Shield className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-100 text-sm">SuperAdmin CRM</h1>
            <p className="text-xs text-slate-500">Vista Administrativa</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-purple-500/10 text-purple-400"
                    : "text-white hover:text-slate-100 hover:bg-slate-800"
                )}
              >
                <item.icon className="h-4 w-4 text-purple-500" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
              <span className="text-xs font-medium text-purple-500">
                {user?.firstName?.[0] || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-100 truncate">
                {user?.firstName || 'Super Admin'} {user?.lastName || ''}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {'email' in (user || {}) ? (user as any).email : 'Super Admin'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start bg-slate-50 text-slate-900 hover:text-slate-800 hover:bg-slate-100"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        <Outlet />
      </main>
    </div>
  );
};
