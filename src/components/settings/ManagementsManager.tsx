import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Management } from "@/types/management";
import { Group } from "@/types/group";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ManagementsManager() {
  const { token } = useAuthStore();
  const [managements, setManagements] = useState<Management[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedManagement, setSelectedManagement] = useState<Management | null>(null);
  const [formData, setFormData] = useState({ name: "", groupId: "none" });
  const { toast } = useToast();

  useEffect(() => {
    fetchManagements();
    fetchGroups();
  }, []);

  const fetchManagements = async () => {
    try {
      const response = await fetch(`${API_URL}/managements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error("Error al cargar gestiones");
      const data = await response.json();
      setManagements(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las gestiones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_URL}/groups`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error("Error al cargar grupos");
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los grupos",
        variant: "destructive",
      });
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/managements`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: formData.name,
          groupId: formData.groupId && formData.groupId !== "none" ? parseInt(formData.groupId) : null
        }),
      });

      if (!response.ok) throw new Error("Error al crear gestión");

      toast({
        title: "Éxito",
        description: "Gestión creada correctamente",
      });

      setIsCreateOpen(false);
      setFormData({ name: "", groupId: "none" });
      fetchManagements();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la gestión",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedManagement || !formData.name.trim()) return;

    try {
      const response = await fetch(`${API_URL}/managements/${selectedManagement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: formData.name,
          groupId: formData.groupId && formData.groupId !== "none" ? parseInt(formData.groupId) : null
        }),
      });

      if (!response.ok) throw new Error("Error al actualizar gestión");

      toast({
        title: "Éxito",
        description: "Gestión actualizada correctamente",
      });

      setIsEditOpen(false);
      setSelectedManagement(null);
      setFormData({ name: "", groupId: "none" });
      fetchManagements();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la gestión",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedManagement) return;

    try {
      const response = await fetch(`${API_URL}/managements/${selectedManagement.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al eliminar gestión");

      toast({
        title: "Éxito",
        description: "Gestión eliminada correctamente",
      });

      setIsDeleteOpen(false);
      setSelectedManagement(null);
      fetchManagements();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la gestión",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (management: Management) => {
    setSelectedManagement(management);
    setFormData({ 
      name: management.name,
      groupId: management.groupId?.toString() || "none"
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (management: Management) => {
    setSelectedManagement(management);
    setIsDeleteOpen(true);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Gestión
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Grupo</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {managements.map((management) => (
            <TableRow key={management.id}>
              <TableCell>{management.id}</TableCell>
              <TableCell>{management.name}</TableCell>
              <TableCell>{management.group?.name || 'Todos los grupos'}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(management)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openDeleteDialog(management)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Gestión</DialogTitle>
            <DialogDescription>
              Ingresa el nombre de la nueva gestión
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la gestión"
              />
            </div>
            <div>
              <Label htmlFor="group">Grupo (Opcional)</Label>
              <Select
                value={formData.groupId}
                onValueChange={(value) => setFormData({ ...formData, groupId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los grupos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Todos los grupos</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Gestión</DialogTitle>
            <DialogDescription>
              Modifica el nombre de la gestión
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la gestión"
              />
            </div>
            <div>
              <Label htmlFor="edit-group">Grupo (Opcional)</Label>
              <Select
                value={formData.groupId}
                onValueChange={(value) => setFormData({ ...formData, groupId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los grupos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Todos los grupos</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la gestión permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
