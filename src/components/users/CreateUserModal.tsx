import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDebounce } from "@/hooks/useDebounce";
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
import { Role, RoleEnum } from "@/types/role";
import { Group } from "@/types/group";
import { User } from "@/types/user";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";

const formSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().optional(),
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  roleId: z.string().min(1, "El rol es requerido"),
  groupId: z.string().optional(),
  ext: z.string().optional(),
  teamLeaderId: z.string().optional(),
});

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}

export function CreateUserModal({ open, onOpenChange, onUserCreated }: CreateUserModalProps) {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<User[]>([]);
  const [teamLeaderSearch, setTeamLeaderSearch] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      roleId: "",
      groupId: "",
      ext: "",
      teamLeaderId: "",
    },
  });

  const selectedRoleId = form.watch("roleId");
  const selectedGroupId = form.watch("groupId");
  const debouncedTeamLeaderSearch = useDebounce(teamLeaderSearch, 500);

  // Determine if role requires group and extension
  const isRoleRequiringGroupAndExt = useMemo(() => {
    const role = roles.find(r => r.id.toString() === selectedRoleId);
    if (!role) return false;
    return [
      RoleEnum.TeamLeader,
      RoleEnum.Agent
    ].includes(role.name as RoleEnum);
  }, [selectedRoleId, roles]);

  // Determine if role should hide group and teamLeader fields
  const shouldHideGroupFields = useMemo(() => {
    const role = roles.find(r => r.id.toString() === selectedRoleId);
    if (!role) return false;
    return [RoleEnum.Admin, RoleEnum.Auditor].includes(role.name as RoleEnum);
  }, [selectedRoleId, roles]);

  // Clear group and teamLeader when role changes to Admin/Auditor (keep ext visible and optional)
  useEffect(() => {
    if (shouldHideGroupFields) {
      form.setValue("groupId", "");
      form.setValue("teamLeaderId", "");
    }
  }, [shouldHideGroupFields]);

  // Fetch team leaders when group changes or search is debounced
  useEffect(() => {
    if (selectedGroupId && !shouldHideGroupFields) {
      fetchTeamLeaders();
    } else {
      setTeamLeaders([]);
      if (!shouldHideGroupFields) {
        form.setValue("teamLeaderId", "");
      }
    }
  }, [selectedGroupId, debouncedTeamLeaderSearch]);

  useEffect(() => {
    if (open) {
      setInitialLoading(true);
      form.reset();
      setTeamLeaderSearch("");
      // Fetch roles and groups in parallel for faster loading
      Promise.all([fetchRoles(), fetchGroups()]).finally(() => {
        setInitialLoading(false);
      });
    }
  }, [open]);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_URL}/roles`);
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

  const fetchTeamLeaders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      // Search for both TeamLeader roles
      params.append("roleName", RoleEnum.TeamLeader);
      if (selectedGroupId) {
        params.append("groupId", selectedGroupId);
      }
      if (debouncedTeamLeaderSearch) {
        params.append("search", debouncedTeamLeaderSearch);
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
  }, [selectedGroupId, debouncedTeamLeaderSearch, token]);

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

      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear usuario");
      }

      toast({
        title: "Usuario creado",
        description: "El usuario se ha creado exitosamente",
      });

      form.reset();
      onUserCreated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el usuario",
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
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Completa la información para crear un nuevo usuario del sistema
          </DialogDescription>
        </DialogHeader>

        {initialLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-muted-foreground">Cargando formulario...</div>
          </div>
        ) : (
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
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

            {!shouldHideGroupFields && (
              <>
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
              </>
            )}

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
                {loading ? "Creando..." : "Crear Usuario"}
              </Button>
            </div>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
