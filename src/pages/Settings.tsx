import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import GroupsManager from "@/components/settings/GroupsManager";
import StatusesManager from "@/components/settings/StatusesManager";
import ManagementsManager from "@/components/settings/ManagementsManager";

export default function Settings() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Administra grupos, estados y gestiones del sistema
        </p>
      </div>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="groups">Grupos</TabsTrigger>
          <TabsTrigger value="statuses">Estados</TabsTrigger>
          <TabsTrigger value="managements">Gestiones</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
