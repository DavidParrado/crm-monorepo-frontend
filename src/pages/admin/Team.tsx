import { Plus } from "lucide-react";
import { useTeam } from "@/hooks/useTeam";
import { useSuperAdminPermissions } from "@/hooks/useSuperAdminPermissions";
import { Button } from "@/components/ui/button";
import { TeamTable } from "@/components/admin/TeamTable";
import { TeamMemberModal } from "@/components/admin/TeamMemberModal";
import { DeleteMemberDialog } from "@/components/admin/DeleteMemberDialog";

const Team = () => {
  const { canManageTeam } = useSuperAdminPermissions();
  const {
    team,
    isLoading,
    isModalOpen,
    modalMode,
    selectedMember,
    createForm,
    updateForm,
    openCreateModal,
    openEditModal,
    closeModal,
    isDeleteDialogOpen,
    memberToDelete,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    isDeleting,
    handleCreateSubmit,
    handleUpdateSubmit,
    isSubmitting,
  } = useTeam();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Equipo</h1>
          <p className="text-slate-700 mt-1">
            Gestiona el equipo de administradores de la plataforma
          </p>
        </div>
        {canManageTeam && (
          <Button
            onClick={openCreateModal}
            className="bg-purple-800 hover:bg-purple-900 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Miembro
          </Button>
        )}
      </div>

      {/* Table */}
      <TeamTable
        team={team}
        isLoading={isLoading}
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
      />

      {/* Create/Edit Modal */}
      <TeamMemberModal
        isOpen={isModalOpen}
        onClose={closeModal}
        mode={modalMode}
        createForm={createForm}
        updateForm={updateForm}
        onCreateSubmit={handleCreateSubmit}
        onUpdateSubmit={handleUpdateSubmit}
        isSubmitting={isSubmitting}
        initialData={selectedMember}
      />

      {/* Delete Dialog */}
      <DeleteMemberDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        member={memberToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Team;
