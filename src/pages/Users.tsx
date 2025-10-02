import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UserTable } from "@/components/users/UserTable";
import { CreateUserModal } from "@/components/users/CreateUserModal";

export default function Users() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUserCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            Administra los usuarios del sistema
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable key={refreshTrigger} onUserUpdated={() => setRefreshTrigger(prev => prev + 1)} />
        </CardContent>
      </Card>

      <CreateUserModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}
