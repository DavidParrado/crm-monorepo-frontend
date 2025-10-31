import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { IconSelector } from "@/components/ui/icon-selector";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { useMetricsManager } from "@/hooks/useMetricsManager";

export default function MetricsManager() {
  const {
    metrics,
    filterOptions,
    isLoading,
    isSubmitting,
    showCreateDialog,
    setShowCreateDialog,
    showEditDialog,
    setShowEditDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    selectedMetric,
    formName,
    setFormName,
    formKey,
    setFormKey,
    formIcon,
    setFormIcon,
    formDisplayOrder,
    setFormDisplayOrder,
    formIsActive,
    setFormIsActive,
    filterField,
    setFilterField,
    filterOperator,
    setFilterOperator,
    filterValue,
    setFilterValue,
    handleCreate,
    handleEdit,
    handleDelete,
    openEditDialog,
    openDeleteDialog,
    resetForm,
    renderFilterDisplay,
  } = useMetricsManager();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Configura las tarjetas del dashboard y sus filtros
        </p>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Métrica
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Clave</TableHead>
              <TableHead>Ícono</TableHead>
              <TableHead>Filtro</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead>Activa</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No hay métricas configuradas
                </TableCell>
              </TableRow>
            ) : (
              metrics.map((metric) => (
                <TableRow key={metric.id}>
                  <TableCell className="font-medium">{metric.name}</TableCell>
                  <TableCell>{metric.key}</TableCell>
                  <TableCell>
                    {metric.icon ? (
                      <div className="flex items-center gap-2">
                        <DynamicIcon name={metric.icon} size={18} />
                        <span className="text-xs text-muted-foreground">{metric.icon}</span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {renderFilterDisplay(metric.filterCriteria)}
                  </TableCell>
                  <TableCell>{metric.displayOrder ?? "-"}</TableCell>
                  <TableCell>
                    <span className={metric.isActive ? "text-green-600" : "text-red-600"}>
                      {metric.isActive ? "Sí" : "No"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(metric)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(metric)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Métrica</DialogTitle>
            <DialogDescription>
              Crea una nueva métrica para mostrar en el dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-name">Nombre *</Label>
              <Input
                id="create-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Clientes Nuevos"
              />
            </div>
            <div>
              <Label htmlFor="create-key">Clave * (sin espacios)</Label>
              <Input
                id="create-key"
                value={formKey}
                onChange={(e) => setFormKey(e.target.value)}
                placeholder="newClients"
              />
            </div>
            <IconSelector
              label="Ícono (opcional)"
              value={formIcon}
              onSelect={setFormIcon}
            />
            
            <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
              <Label className="text-base font-semibold">Condición de Filtro *</Label>
              
              <div>
                <Label htmlFor="create-filter-field">Campo a Filtrar *</Label>
                <Select value={filterField} onValueChange={(val) => {
                  setFilterField(val);
                  setFilterValue("");
                  setFilterOperator("equals");
                }}>
                  <SelectTrigger id="create-filter-field">
                    <SelectValue placeholder="Selecciona un campo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="statusId">Estado del Cliente</SelectItem>
                    <SelectItem value="lastManagementId">Última Gestión</SelectItem>
                    <SelectItem value="country">País</SelectItem>
                    <SelectItem value="groupId">Grupo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filterField && (
                <div>
                  <Label htmlFor="create-filter-value">Valor</Label>
                  {filterField === "statusId" && (
                    <Select value={filterValue} onValueChange={setFilterValue}>
                      <SelectTrigger id="create-filter-value">
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.statuses?.map((status) => (
                          <SelectItem key={status.id} value={status.id.toString()}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {filterField === "lastManagementId" && (
                    <Select value={filterValue} onValueChange={setFilterValue}>
                      <SelectTrigger id="create-filter-value">
                        <SelectValue placeholder="Selecciona una gestión" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.managements?.map((management) => (
                          <SelectItem key={management.id} value={management.id.toString()}>
                            {management.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {filterField === "country" && (
                    <Select value={filterValue} onValueChange={setFilterValue}>
                      <SelectTrigger id="create-filter-value">
                        <SelectValue placeholder="Selecciona un país" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.countries?.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {filterField === "groupId" && (
                    <Select value={filterValue} onValueChange={setFilterValue}>
                      <SelectTrigger id="create-filter-value">
                        <SelectValue placeholder="Selecciona un grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.groups?.map((group) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="create-order">Orden de Visualización</Label>
              <Input
                id="create-order"
                type="number"
                value={formDisplayOrder}
                onChange={(e) => setFormDisplayOrder(e.target.value)}
                placeholder="1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create-active"
                checked={formIsActive}
                onCheckedChange={(checked) => setFormIsActive(checked as boolean)}
              />
              <Label htmlFor="create-active">Métrica activa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              resetForm();
            }} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Métrica</DialogTitle>
            <DialogDescription>
              Modifica los datos de la métrica
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-key">Clave</Label>
              <Input
                id="edit-key"
                value={formKey}
                onChange={(e) => setFormKey(e.target.value)}
              />
            </div>
            <IconSelector
              label="Ícono"
              value={formIcon}
              onSelect={setFormIcon}
            />
            
            <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
              <Label className="text-base font-semibold">Condición de Filtro</Label>
              
              <div>
                <Label htmlFor="edit-filter-field">Campo a Filtrar *</Label>
                <Select value={filterField} onValueChange={(val) => {
                  setFilterField(val);
                  setFilterValue("");
                  setFilterOperator("equals");
                }}>
                  <SelectTrigger id="edit-filter-field">
                    <SelectValue placeholder="Selecciona un campo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="statusId">Estado del Cliente</SelectItem>
                    <SelectItem value="lastManagementId">Última Gestión</SelectItem>
                    <SelectItem value="country">País</SelectItem>
                    <SelectItem value="groupId">Grupo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filterField && (
                <div>
                  <Label htmlFor="edit-filter-value">Valor</Label>
                  {filterField === "statusId" && (
                    <Select value={filterValue} onValueChange={setFilterValue}>
                      <SelectTrigger id="edit-filter-value">
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.statuses?.map((status) => (
                          <SelectItem key={status.id} value={status.id.toString()}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {filterField === "lastManagementId" && (
                    <Select value={filterValue} onValueChange={setFilterValue}>
                      <SelectTrigger id="edit-filter-value">
                        <SelectValue placeholder="Selecciona una gestión" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.managements?.map((management) => (
                          <SelectItem key={management.id} value={management.id.toString()}>
                            {management.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {filterField === "country" && (
                    <Select value={filterValue} onValueChange={setFilterValue}>
                      <SelectTrigger id="edit-filter-value">
                        <SelectValue placeholder="Selecciona un país" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.countries?.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {filterField === "groupId" && (
                    <Select value={filterValue} onValueChange={setFilterValue}>
                      <SelectTrigger id="edit-filter-value">
                        <SelectValue placeholder="Selecciona un grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.groups?.map((group) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="edit-order">Orden de Visualización</Label>
              <Input
                id="edit-order"
                type="number"
                value={formDisplayOrder}
                onChange={(e) => setFormDisplayOrder(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-active"
                checked={formIsActive}
                onCheckedChange={(checked) => setFormIsActive(checked as boolean)}
              />
              <Label htmlFor="edit-active">Métrica activa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              resetForm();
            }} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar métrica?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La métrica "{selectedMetric?.name}" será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
