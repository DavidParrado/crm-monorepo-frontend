import { Plus } from "lucide-react";
import { useTenants } from "@/hooks/useTenants";
import { useSuperAdminPermissions } from "@/hooks/useSuperAdminPermissions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TenantTable } from "@/components/admin/TenantTable";
import { TenantModal } from "@/components/admin/TenantModal";
import { DeleteTenantDialog } from "@/components/admin/DeleteTenantDialog";
import { HardDeleteDialog } from "@/components/admin/HardDeleteDialog";
import { ResetPasswordModal } from "@/components/admin/ResetPasswordModal";

const Tenants = () => {
  const { canEditTenants } = useSuperAdminPermissions();
  const {
    activeTab,
    setActiveTab,
    tenants,
    isLoading,
    isModalOpen,
    modalMode,
    selectedTenant,
    createForm,
    updateForm,
    resetPasswordForm,
    openCreateModal,
    openEditModal,
    closeModal,
    isDeleteDialogOpen,
    tenantToDelete,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    isDeleting,
    isHardDeleteDialogOpen,
    tenantToHardDelete,
    openHardDeleteDialog,
    closeHardDeleteDialog,
    confirmHardDelete,
    isHardDeleting,
    isResetPasswordModalOpen,
    tenantToResetPassword,
    openResetPasswordModal,
    closeResetPasswordModal,
    handleResetPasswordSubmit,
    isResettingPassword,
    handleRestore,
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
        {canEditTenants && activeTab === 'active' && (
          <Button
            onClick={openCreateModal}
            className="bg-purple-800 hover:bg-purple-900 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Tenant
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'trash')}>
        <TabsList className="bg-slate-100 border border-slate-200">
          <TabsTrigger 
            value="active"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-800"
          >
            Activos
          </TabsTrigger>
          <TabsTrigger 
            value="trash"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-800"
          >
            Papelera
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table */}
      <TenantTable
        tenants={tenants}
        isLoading={isLoading}
        activeTab={activeTab}
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
        onResetPassword={openResetPasswordModal}
        onRestore={handleRestore}
        onHardDelete={openHardDeleteDialog}
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

      {/* Soft Delete Dialog */}
      <DeleteTenantDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        tenant={tenantToDelete}
        isDeleting={isDeleting}
      />

      {/* Hard Delete Dialog */}
      <HardDeleteDialog
        isOpen={isHardDeleteDialogOpen}
        onClose={closeHardDeleteDialog}
        onConfirm={confirmHardDelete}
        tenant={tenantToHardDelete}
        isDeleting={isHardDeleting}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={closeResetPasswordModal}
        form={resetPasswordForm}
        onSubmit={handleResetPasswordSubmit}
        isSubmitting={isResettingPassword}
        tenant={tenantToResetPassword}
      />
    </div>
  );
};

export default Tenants;
