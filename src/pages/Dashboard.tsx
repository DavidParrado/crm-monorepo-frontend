import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter } from "lucide-react";
import { useAuthRoles } from "@/hooks/useAuthRoles";
import { toast } from "sonner";
import { useClients } from "@/hooks/useClients";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useClientFilters } from "@/hooks/useClientFilters";
import * as clientService from "@/services/clientService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ClientFilters } from "@/components/dashboard/ClientFilters";
import { ClientTable } from "@/components/dashboard/ClientTable";
import { ClientTableActions } from "@/components/dashboard/ClientTableActions";
import { ClientPagination } from "@/components/dashboard/ClientPagination";
import { AssignClientDialog } from "@/components/dashboard/AssignClientDialog";
import { DeleteClientDialog } from "@/components/dashboard/DeleteClientDialog";
import { BulkDeleteDialog } from "@/components/dashboard/BulkDeleteDialog";


export default function Dashboard() {
  const { isAdmin, isTeamLeader } = useAuthRoles();
  const navigate = useNavigate();

  // Role-based permissions
  const canFilterByUser = isAdmin || isTeamLeader;
  const canFilterByGroup = isAdmin;

  // Custom hooks for data management
  const {
    clients,
    total,
    totalPages,
    isLoading,
    selectedRows,
    setSelectedRows,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    limit,
    setLimit,
    debouncedSearch,
    selectedCountry,
    setSelectedCountry,
    selectedCampaign,
    setSelectedCampaign,
    selectedStatus,
    setSelectedStatus,
    selectedUser,
    setSelectedUser,
    selectedGroup,
    setSelectedGroup,
    selectedManagement,
    setSelectedManagement,
    clearFilters,
    hasActiveFilters,
    refetchClients,
  } = useClients();

  const { stats, isLoadingStats } = useDashboardStats();
  const { filterOptions } = useClientFilters();

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteClientId, setDeleteClientId] = useState<number | null>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);


  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(clients.map((c) => c.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };


  // Handle stat card click
  const handleStatClick = (filter: Record<string, any>) => {
    if (!filter) return;
    
    // Clear all filters first
    clearFilters();

    // Apply the filter from the card
    if (filter.statusId) {
      setSelectedStatus(filter.statusId.toString());
    }
    if (filter.lastManagementId) {
      setSelectedManagement(filter.lastManagementId.toString());
    }

    // Reset to page 1 and show filters
    setCurrentPage(1);
    setShowFilters(true);
  };

  // Action handlers
  const handleBulkAssign = async () => {
    if (!selectedAssigneeId || selectedRows.length === 0) {
      toast.error("Selecciona un usuario para asignar");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await clientService.bulkAssignClients(
        selectedRows,
        parseInt(selectedAssigneeId)
      );
      toast.success(result.message);
      setShowAssignDialog(false);
      setSelectedAssigneeId("");
      refetchClients();
    } catch (error) {
      console.error("Error assigning clients:", error);
      toast.error(error instanceof Error ? error.message : "Error al asignar clientes");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkUnassign = async () => {
    if (selectedRows.length === 0) return;

    setIsProcessing(true);
    try {
      const result = await clientService.bulkUnassignClients(selectedRows);
      toast.success(result.message);
      refetchClients();
    } catch (error) {
      console.error("Error unassigning clients:", error);
      toast.error(error instanceof Error ? error.message : "Error al desasignar clientes");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    if (selectedRows.length === 0) return;

    setIsProcessing(true);
    try {
      const blob = await clientService.exportClients(selectedRows);

      // Create blob and download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "clientes.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Clientes exportados exitosamente");
      setSelectedRows([]);
    } catch (error) {
      console.error("Error exporting clients:", error);
      toast.error(error instanceof Error ? error.message : "Error al exportar clientes");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!deleteClientId) return;

    setIsProcessing(true);
    try {
      await clientService.deleteClient(deleteClientId);
      toast.success("Cliente eliminado exitosamente");
      setShowDeleteDialog(false);
      setDeleteClientId(null);
      refetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error(error instanceof Error ? error.message : "Error al eliminar cliente");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.error("Por favor selecciona al menos un cliente");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await clientService.bulkDeleteClients(selectedRows);
      toast.success(result.message || "Clientes eliminados exitosamente");
      setShowBulkDeleteDialog(false);
      refetchClients();
    } catch (error) {
      console.error("Error deleting clients:", error);
      toast.error(error instanceof Error ? error.message : "Error al eliminar clientes");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Vista general de tus clientes y actividades
        </p>
      </div>

      {/* Stats Cards - Dynamic rendering */}
      <DashboardStats 
        stats={stats} 
        isLoading={isLoadingStats} 
        onStatClick={handleStatClick} 
      />

      {/* Tabla de Clientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Clientes ({total})</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                placeholder="Buscar clientes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-64"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {[
                      selectedCountry !== "all" && selectedCountry,
                      selectedCampaign !== "all" && selectedCampaign,
                      selectedStatus !== "all" && selectedStatus,
                      selectedUser !== "all" && selectedUser,
                      selectedGroup !== "all" && selectedGroup,
                      selectedManagement !== "all" && selectedManagement
                    ].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <ClientFilters
              filterOptions={filterOptions}
              selectedCountry={selectedCountry}
              selectedCampaign={selectedCampaign}
              selectedStatus={selectedStatus}
              selectedUser={selectedUser}
              selectedGroup={selectedGroup}
              selectedManagement={selectedManagement}
              canFilterByUser={canFilterByUser}
              canFilterByGroup={canFilterByGroup}
              hasActiveFilters={hasActiveFilters}
              onCountryChange={setSelectedCountry}
              onCampaignChange={setSelectedCampaign}
              onStatusChange={setSelectedStatus}
              onUserChange={setSelectedUser}
              onGroupChange={setSelectedGroup}
              onManagementChange={setSelectedManagement}
              onClearFilters={clearFilters}
            />
          )}
        </CardHeader>
        <CardContent>
          {/* Acciones masivas */}
          {isAdmin && (
            <ClientTableActions
              selectedCount={selectedRows.length}
              isProcessing={isProcessing}
              onAssign={() => setShowAssignDialog(true)}
              onUnassign={handleBulkUnassign}
              onExport={handleExport}
              onDelete={() => setShowBulkDeleteDialog(true)}
            />
          )}

          <ClientTable
            clients={clients}
            isLoading={isLoading}
            selectedRows={selectedRows}
            hasActiveFilters={hasActiveFilters}
            debouncedSearch={debouncedSearch}
            isAdmin={isAdmin}
            onSelectAll={handleSelectAll}
            onSelectRow={handleSelectRow}
            onViewDetail={(clientId) => navigate(`/clients/${clientId}`)}
            onDelete={(clientId) => {
              setDeleteClientId(clientId);
              setShowDeleteDialog(true);
            }}
          />

          {/* Paginación */}
          {!isLoading && clients.length > 0 && (
            <ClientPagination
              currentPage={currentPage}
              totalPages={totalPages}
              limit={limit}
              total={total}
              onPageChange={setCurrentPage}
              onLimitChange={setLimit}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AssignClientDialog
        open={showAssignDialog}
        selectedCount={selectedRows.length}
        selectedAssigneeId={selectedAssigneeId}
        isProcessing={isProcessing}
        onOpenChange={setShowAssignDialog}
        onAssigneeChange={setSelectedAssigneeId}
        onConfirm={handleBulkAssign}
      />

      <DeleteClientDialog
        open={showDeleteDialog}
        isProcessing={isProcessing}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setDeleteClientId(null);
        }}
        onConfirm={handleDeleteClient}
      />

      <BulkDeleteDialog
        open={showBulkDeleteDialog}
        selectedCount={selectedRows.length}
        isProcessing={isProcessing}
        onOpenChange={setShowBulkDeleteDialog}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
