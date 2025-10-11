import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuthStore } from "@/store/authStore";

export function MainLayout() {
  const navigate = useNavigate();
  // Al recargar, isLoading es TRUE (ver authStore.ts)
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isInitialAuthCheckComplete, setIsInitialAuthCheckComplete] = useState(false);


  const runAuthCheck = useCallback(async () => {
    // 1. Ejecuta la verificación
    await checkAuth();
    // 2. Una vez que termina (éxito o fallo), establece el estado a true
    setIsInitialAuthCheckComplete(true);
  }, [checkAuth]);

  useEffect(() => {
    // Inicia el chequeo de autenticación.
    runAuthCheck();
  }, [runAuthCheck]);

  // CAMBIO CLAVE EN LA LÓGICA DE REDIRECCIÓN
  useEffect(() => {
    // Solo redirige si ya terminó de cargar Y no está autenticado.
    // Esto asegura que NO redirija mientras isLoading sea true (al inicio).
    if (isInitialAuthCheckComplete && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isInitialAuthCheckComplete, navigate]);

  // Si isLoading es true (al inicio o al cargar), se muestra el spinner.
  if (!isInitialAuthCheckComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-4">
              <SidebarTrigger />
            </div>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}