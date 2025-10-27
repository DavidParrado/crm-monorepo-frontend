import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Eye, Filter, Trash2 } from "lucide-react";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { useAuthStore } from "@/store/authStore";
import { RoleEnum } from "@/types/role";
import { Client } from "@/types/client";
import { toast } from "sonner";
import { useClients } from "@/hooks/useClients";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useClientFilters } from "@/hooks/useClientFilters";
import * as clientService from "@/services/clientService";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { UserSelector } from "@/components/client/UserSelector";


export default function Dashboard() {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();

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

  // Role-based permissions
  const userRole = user?.role?.name as RoleEnum;
  const canFilterByUser = userRole === RoleEnum.Admin || userRole === RoleEnum.TeamLeader;
  const canFilterByGroup = userRole === RoleEnum.Admin;
  const isAdmin = userRole === RoleEnum.Admin;

  // Handle stat card click
  const handleStatClick = (filter: Record<string, any>) => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingStats ? (
          // Loading skeletons
          [...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          stats.map((stat) => (
            <Card
              key={stat.key}
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
              onClick={() => handleStatClick(stat.filterCriteria)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.name}
                    </p>
                    <h3 className="text-3xl font-bold mt-2">
                      {stat.count}
                    </h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {stat.icon ? (
                      <DynamicIcon name={stat.icon} className="h-6 w-6 text-primary" />
                    ) : (
                      <Users className="h-6 w-6 text-primary" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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
            <div className="mt-4 p-4 border rounded-lg bg-muted/30 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Country Filter */}
                {filterOptions.countries && filterOptions.countries.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">País</label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los países" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {filterOptions.countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Campaign Filter */}
                {filterOptions.campaigns && filterOptions.campaigns.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Campaña</label>
                    <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las campañas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {filterOptions.campaigns.map((campaign) => (
                          <SelectItem key={campaign} value={campaign}>
                            {campaign}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Status Filter */}
                {filterOptions.statuses && filterOptions.statuses.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado</label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {filterOptions.statuses.map((status) => (
                          <SelectItem key={status.id} value={status.id.toString()}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* User Filter - Only for Admin and TeamLeader */}
                {canFilterByUser && filterOptions.assignedUsers && filterOptions.assignedUsers.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Asignado a</label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los usuarios" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {filterOptions.assignedUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Group Filter - Only for Admin */}
                {canFilterByGroup && filterOptions.groups && filterOptions.groups.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Grupo</label>
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los grupos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {filterOptions.groups.map((group) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Management Filter */}
                {filterOptions.managements && filterOptions.managements.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Última Gestión</label>
                    <Select value={selectedManagement} onValueChange={setSelectedManagement}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las gestiones" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {filterOptions.managements.map((management) => (
                          <SelectItem key={management.id} value={management.id.toString()}>
                            {management.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Acciones masivas */}
          {isAdmin && selectedRows.length > 0 && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
              <span className="text-sm font-medium">
                {selectedRows.length} seleccionado{selectedRows.length > 1 ? "s" : ""}
              </span>
              <div className="flex gap-2 ml-auto">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowAssignDialog(true)}
                  disabled={isProcessing}
                >
                  Asignar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleBulkUnassign}
                  disabled={isProcessing}
                >
                  Desasignar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleExport}
                  disabled={isProcessing}
                >
                  Exportar
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => setShowBulkDeleteDialog(true)}
                  disabled={isProcessing}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={clients.length > 0 && selectedRows.length === clients.length}
                      onCheckedChange={handleSelectAll}
                      disabled={isLoading || clients.length === 0}
                    />
                  </TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Asignado a</TableHead>
                  <TableHead className="text-right w-[200px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : clients.length === 0 ? (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Users className="h-12 w-12 mb-2 opacity-50" />
                        <p className="text-lg font-medium">No se encontraron clientes</p>
                        <p className="text-sm">
                          {hasActiveFilters || debouncedSearch
                            ? "Intenta ajustar los filtros o la búsqueda"
                            : "Aún no hay clientes registrados"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Client rows
                  clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.includes(client.id)}
                          onCheckedChange={(checked) =>
                            handleSelectRow(client.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {client.firstName} {client.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {client.email}
                      </TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>{client.country}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {client.status?.name || "Sin estado"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {client.assignedTo
                          ? `${client.assignedTo.firstName} ${client.assignedTo.lastName || ""}`
                          : "Sin asignar"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/clients/${client.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver detalle
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeleteClientId(client.id);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {!isLoading && clients.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Filas por página:</span>
                  <Select
                    value={limit.toString()}
                    onValueChange={(value) => {
                      setLimit(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground">
                  Mostrando {(currentPage - 1) * limit + 1}-
                  {Math.min(currentPage * limit, total)} de {total} resultados
                </p>
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {totalPages > 5 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(totalPages)}
                          isActive={currentPage === totalPages}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Clientes</DialogTitle>
            <DialogDescription>
              Selecciona un usuario para asignar {selectedRows.length} cliente
              {selectedRows.length > 1 ? "s" : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Usuario</Label>
              <UserSelector
                value={selectedAssigneeId}
                onValueChange={setSelectedAssigneeId}
                token={token}
                disabled={isProcessing}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAssignDialog(false);
                setSelectedAssigneeId("");
              }}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button onClick={handleBulkAssign} disabled={isProcessing || !selectedAssigneeId}>
              {isProcessing ? "Asignando..." : "Asignar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el cliente
              de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteClientId(null);
              }}
              disabled={isProcessing}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClient}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán permanentemente{" "}
              {selectedRows.length} cliente{selectedRows.length > 1 ? "s" : ""} de la base
              de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowBulkDeleteDialog(false)}
              disabled={isProcessing}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
