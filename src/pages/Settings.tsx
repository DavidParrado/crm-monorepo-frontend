import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import GroupsManager from "@/components/settings/GroupsManager";
import StatusesManager from "@/components/settings/StatusesManager";
import ManagementsManager from "@/components/settings/ManagementsManager";
import MetricsManager from "@/components/settings/MetricsManager";
import { useAuthStore } from "@/store/authStore";
import { RoleEnum } from "@/types/role";

export default function Settings() {
  const { user } = useAuthStore();
  const isAdmin = user?.role?.name === RoleEnum.Admin;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Administra grupos, estados, gestiones y métricas del sistema
        </p>
      </div>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="groups">Grupos</TabsTrigger>
          <TabsTrigger value="statuses">Estados</TabsTrigger>
          <TabsTrigger value="managements">Gestiones</TabsTrigger>
          {isAdmin && <TabsTrigger value="metrics">Métricas</TabsTrigger>}
        </TabsList>

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Grupos</CardTitle>
              <CardDescription>
                Administra los grupos disponibles en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GroupsManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statuses">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Estados</CardTitle>
              <CardDescription>
                Administra los estados de clientes disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StatusesManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="managements">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Gestiones</CardTitle>
              <CardDescription>
                Administra los tipos de gestión disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ManagementsManager />
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Métricas</CardTitle>
                <CardDescription>
                  Configura las tarjetas del dashboard y sus filtros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MetricsManager />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
