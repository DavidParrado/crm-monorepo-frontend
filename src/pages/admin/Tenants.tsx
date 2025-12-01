import { Plus } from "lucide-react";
import { useTenants } from "@/hooks/useTenants";
import { Button } from "@/components/ui/button";
import { TenantTable } from "@/components/admin/TenantTable";
import { TenantModal } from "@/components/admin/TenantModal";
import { DeleteTenantDialog } from "@/components/admin/DeleteTenantDialog";

const Tenants = () => {
  const {
    tenants,
    isLoading,
    isModalOpen,
    modalMode,
    selectedTenant,
    createForm,
    updateForm,
    openCreateModal,
    openEditModal,
    closeModal,
    isDeleteDialogOpen,
    tenantToDelete,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    isDeleting,
    handleCreateSubmit,
    handleUpdateSubmit,
    isSubmitting,
  } = useTenants();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tenants</h1>
          <p className="text-slate-700 mt-1">
            Gestiona los clientes (tenants) de la plataforma
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-purple-800 hover:bg-purple-900 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Tenant
        </Button>
      </div>

      {/* Table */}
      <TenantTable
        tenants={tenants}
        isLoading={isLoading}
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
      />

      {/* Create/Edit Modal */}
      <TenantModal
        isOpen={isModalOpen}
        onClose={closeModal}
        mode={modalMode}
        createForm={createForm}
        updateForm={updateForm}
        onCreateSubmit={handleCreateSubmit}
        onUpdateSubmit={handleUpdateSubmit}
        isSubmitting={isSubmitting}
        initialData={selectedTenant}
      />

      {/* Delete Dialog */}
      <DeleteTenantDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        tenant={tenantToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Tenants;
