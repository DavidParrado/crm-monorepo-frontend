import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UserTable } from "@/components/users/UserTable";
import { CreateUserModal } from "@/components/users/CreateUserModal";
import { EditUserModal } from "@/components/users/EditUserModal";
import { ResetPasswordModal } from "@/components/users/ResetPasswordModal";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";
import { useUserTable } from "@/hooks/useUserTable";
import { useState } from "react";

export default function Users() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const {
    users,
    total,
    currentPage,
    totalPages,
    search,
    loading,
    editingUser,
    setEditingUser,
    resetPasswordUser,
    setResetPasswordUser,
    deletingUser,
    setDeletingUser,
    isDeleting,
    handleSearchChange,
    handlePageChange,
    handleDelete,
    refetchUsers,
  } = useUserTable();

  const handleUserCreated = () => {
    refetchUsers();
    setIsCreateModalOpen(false);
  };

  const handleUserUpdated = () => {
    refetchUsers();
    setEditingUser(null);
  };

  const handlePasswordReset = () => {
    setResetPasswordUser(null);
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
          <UserTable
            users={users}
            total={total}
            currentPage={currentPage}
            totalPages={totalPages}
            search={search}
            loading={loading}
            onSearchChange={handleSearchChange}
            onPageChange={handlePageChange}
            onEdit={setEditingUser}
            onResetPassword={setResetPasswordUser}
            onDelete={setDeletingUser}
          />
        </CardContent>
      </Card>

      <CreateUserModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onUserCreated={handleUserCreated}
      />

      {editingUser && (
        <EditUserModal
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {resetPasswordUser && (
        <ResetPasswordModal
          user={resetPasswordUser}
          open={!!resetPasswordUser}
          onOpenChange={(open) => !open && setResetPasswordUser(null)}
          onPasswordReset={handlePasswordReset}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          open={!!deletingUser}
          onOpenChange={(open) => !open && setDeletingUser(null)}
          onConfirm={handleDelete}
          loading={isDeleting}
        />
      )}
    </div>
  );
}
