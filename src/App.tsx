import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { MainLayout } from "./components/layout/MainLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import AppointmentDetail from "./pages/AppointmentDetail";
import Notifications from "./pages/Notifications";
import ClientDetail from "./pages/ClientDetail";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Imports from "./pages/Imports";
import VoIP from "./pages/VoIP";
import Kanban from "./pages/Kanban";
import NotFound from "./pages/NotFound";
import SuperAdminLogin from "./pages/admin/SuperAdminLogin";
import Tenants from "./pages/admin/Tenants";
import TenantDetail from "./pages/admin/TenantDetail";
import Team from "./pages/admin/Team";
import AdminIntegrations from "./pages/admin/Integrations";

const queryClient = new QueryClient();

const App = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // Validate session on app mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Regular CRM Routes */}
          <Route path="/login" element={<Login />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/appointments/:id" element={<AppointmentDetail />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/imports" element={<Imports />} />
            <Route path="/voip" element={<VoIP />} />
            <Route path="/kanban" element={<Kanban />} />
          </Route>

          {/* Super Admin Control Plane Routes */}
          <Route path="/admin/login" element={<SuperAdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/tenants" replace />} />
            <Route path="tenants" element={<Tenants />} />
            <Route path="tenants/:id" element={<TenantDetail />} />
            <Route path="team" element={<Team />} />
            <Route path="integrations" element={<AdminIntegrations />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
