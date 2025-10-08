import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { User } from "@/types/user";
import { Role, RoleEnum } from "@/types/role";
import { Group } from "@/types/group";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";

const formSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().optional(),
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  roleId: z.string().min(1, "El rol es requerido"),
  groupId: z.string().optional(),
  ext: z.string().optional(),
  teamLeaderId: z.string().optional(),
});

interface EditUserModalProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export function EditUserModal({ user, open, onOpenChange, onUserUpdated }: EditUserModalProps) {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<User[]>([]);
  const [teamLeaderSearch, setTeamLeaderSearch] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName || "",
      username: user.username,
      roleId: user.roleId.toString(),
      groupId: user.groupId?.toString() || "",
      ext: user.ext?.toString() || "",
      teamLeaderId: user.teamLeaderId?.toString() || "",
    },
  });

  const selectedRoleId = form.watch("roleId");
  const selectedGroupId = form.watch("groupId");

  // Determine if extension and group are required based on role
  const isRoleRequiringGroupAndExt = useMemo(() => {
    const role = roles.find(r => r.id.toString() === selectedRoleId);
    if (!role) return false;
    return [
      RoleEnum.TeamLeaderFTD,
      RoleEnum.TeamLeaderRete,
      RoleEnum.AgenteFTD,
      RoleEnum.AgenteRete
    ].includes(role.name as RoleEnum);
  }, [selectedRoleId, roles]);

  // Fetch team leaders when group changes
  useEffect(() => {
    if (selectedGroupId) {
      fetchTeamLeaders();
    } else {
      setTeamLeaders([]);
    }
  }, [selectedGroupId, teamLeaderSearch]);

  useEffect(() => {
    if (open) {
      fetchRoles();
      fetchGroups();
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName || "",
        username: user.username,
        roleId: user.roleId.toString(),
        groupId: user.groupId?.toString() || "",
        ext: user.ext?.toString() || "",
        teamLeaderId: user.teamLeaderId?.toString() || "",
      });
      if (user.groupId) {
        fetchTeamLeaders();
      }
    }
  }, [open, user]);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_URL}/roles`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los roles",
        variant: "destructive",
      });
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_URL}/groups`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!response.ok) throw new Error();
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

  const fetchTeamLeaders = async () => {
    try {
      const params = new URLSearchParams();
      params.append("roleName", RoleEnum.TeamLeaderFTD);
      params.append("roleName", RoleEnum.TeamLeaderRete);
      if (selectedGroupId) {
        params.append("groupId", selectedGroupId);
      }
      if (teamLeaderSearch) {
        params.append("search", teamLeaderSearch);
      }

      const response = await fetch(`${API_URL}/users?${params}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setTeamLeaders(data.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los team leaders",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Validate required fields based on role
    if (isRoleRequiringGroupAndExt) {
      if (!values.groupId) {
        toast({
          title: "Error",
          description: "El grupo es requerido para este rol",
          variant: "destructive",
        });
        return;
      }
      if (!values.ext) {
        toast({
          title: "Error",
          description: "La extensión es requerida para este rol",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        ...values,
        roleId: parseInt(values.roleId),
        groupId: values.groupId ? parseInt(values.groupId) : null,
        ext: values.ext ? values.ext : null,
        teamLeaderId: values.teamLeaderId ? parseInt(values.teamLeaderId) : null,
      };

      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar usuario");
      }

      toast({
        title: "Usuario actualizado",
        description: "Los cambios se han guardado exitosamente",
      });

      onUserUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifica la información del usuario
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Grupo {isRoleRequiringGroupAndExt && <span className="text-destructive">*</span>}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un grupo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teamLeaderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Leader (Opcional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!selectedGroupId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedGroupId 
                            ? "Primero selecciona un grupo" 
                            : "Selecciona un team leader"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Buscar team leader..."
                          value={teamLeaderSearch}
                          onChange={(e) => setTeamLeaderSearch(e.target.value)}
                          className="mb-2"
                        />
                      </div>
                      {teamLeaders.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          No hay team leaders disponibles
                        </div>
                      ) : (
                        teamLeaders.map((leader) => (
                          <SelectItem key={leader.id} value={leader.id.toString()}>
                            {leader.firstName} {leader.lastName} ({leader.username})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ext"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Extensión {isRoleRequiringGroupAndExt && <span className="text-destructive">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
