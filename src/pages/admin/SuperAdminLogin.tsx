import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  username: z.string().min(1, "El usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const { loginSuperAdmin, isAuthenticated, isSuperAdmin, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated && isSuperAdmin) {
      navigate("/admin/tenants", { replace: true });
    }
  }, [isAuthenticated, isSuperAdmin, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await loginSuperAdmin(data.username, data.password);
      navigate("/admin/tenants", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg--950 p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950" />
      
      <Card className="w-full max-w-md relative z-10 bg-white border-slate-800">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-800/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-purple-800" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              SuperAdmin CRM
            </CardTitle>
            <CardDescription className="text-slate-700 mt-1">
              Acceso exclusivo para Super Administradores
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700">
                Email
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                className="bg-slate-50 border-slate-700 text-slate-900 placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                {...form.register("username")}
              />
              {form.formState.errors.username && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-slate-50 border-slate-700 text-slate-900 placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20 pr-10"
                  {...form.register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-slate-700 hover:text-slate-900 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-800 hover:bg-purple-900 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-xs text-center text-slate-500">
              Este acceso está reservado únicamente para administradores del sistema.
              <br />
              Si necesitas acceder al CRM, usa el{" "}
              <a href="/login" className="text-purple-500 hover:underline">
                inicio de sesión regular
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminLogin;
