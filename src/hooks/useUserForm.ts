import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDebounce } from "@/hooks/useDebounce";
import { User } from "@/types/user";
import { Role, RoleEnum } from "@/types/role";
import { Group } from "@/types/group";
import * as userService from "@/services/userService";
import * as settingsService from "@/services/settingsService";
import { toast } from "sonner";

const createSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es requerido").max(100, "El nombre debe tener menos de 100 caracteres"),
  lastName: z.string().trim().max(100, "El apellido debe tener menos de 100 caracteres").optional(),
  username: z.string().trim().min(3, "El usuario debe tener al menos 3 caracteres").max(50, "El usuario debe tener menos de 50 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  roleId: z.string().min(1, "El rol es requerido"),
  groupId: z.string().optional(),
  ext: z.string().trim().max(20, "La extensión debe tener menos de 20 caracteres").optional(),
  teamLeaderId: z.string().optional(),
});

const editSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es requerido").max(100, "El nombre debe tener menos de 100 caracteres"),
  lastName: z.string().trim().max(100, "El apellido debe tener menos de 100 caracteres").optional(),
  username: z.string().trim().min(3, "El usuario debe tener al menos 3 caracteres").max(50, "El usuario debe tener menos de 50 caracteres"),
  roleId: z.string().min(1, "El rol es requerido"),
  groupId: z.string().optional(),
  ext: z.string().trim().max(20, "La extensión debe tener menos de 20 caracteres").optional(),
  teamLeaderId: z.string().optional(),
});

interface UseUserFormProps {
  user?: User;
  open: boolean;
  onSuccess: () => void;
}

export const useUserForm = ({ user, open, onSuccess }: UseUserFormProps) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<User[]>([]);
  const [teamLeaderSearch, setTeamLeaderSearch] = useState("");

  const isEditMode = !!user;
  const schema = isEditMode ? editSchema : createSchema;

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: isEditMode ? {
      firstName: user.firstName,
      lastName: user.lastName || "",
      username: user.username,
      roleId: user.roleId.toString(),
      groupId: user.groupId?.toString() || "",
      ext: user.ext?.toString() || "",
      teamLeaderId: user.teamLeaderId?.toString() || "",
    } : {
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
    return [RoleEnum.TeamLeader, RoleEnum.Agent].includes(role.name as RoleEnum);
  }, [selectedRoleId, roles]);

  // Determine if role should hide group and teamLeader fields
  const shouldHideGroupFields = useMemo(() => {
    const role = roles.find(r => r.id.toString() === selectedRoleId);
    if (!role) return false;
    return [RoleEnum.Admin, RoleEnum.Auditor].includes(role.name as RoleEnum);
  }, [selectedRoleId, roles]);

  // Clear group and teamLeader when role changes to Admin/Auditor
  useEffect(() => {
    if (shouldHideGroupFields) {
      form.setValue("groupId", "");
      form.setValue("teamLeaderId", "");
    }
  }, [shouldHideGroupFields, form]);

  // Fetch team leaders when group changes or search is debounced
  const fetchTeamLeaders = async () => {
    if (!selectedGroupId) return;
    
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        groupId: selectedGroupId,
      });

      if (debouncedTeamLeaderSearch) {
        params.append("search", debouncedTeamLeaderSearch);
      }

      const data = await userService.getUsers(params);
      const teamLeaderRole = roles.find(r => r.name === RoleEnum.TeamLeader);
      if (teamLeaderRole) {
        const filteredTeamLeaders = data.data.filter(
          u => u.roleId === teamLeaderRole.id
        );
        setTeamLeaders(filteredTeamLeaders);
      }
    } catch (error: any) {
      toast.error(error.message || "Error al cargar los team leaders");
    }
  };

  useEffect(() => {
    if (selectedGroupId && !shouldHideGroupFields) {
      fetchTeamLeaders();
    } else {
      setTeamLeaders([]);
      if (!shouldHideGroupFields) {
        form.setValue("teamLeaderId", "");
      }
    }
  }, [selectedGroupId, debouncedTeamLeaderSearch, shouldHideGroupFields]);

  // Initialize data when modal opens
  useEffect(() => {
    if (open) {
      setInitialLoading(true);
      
      if (isEditMode) {
        form.reset({
          firstName: user.firstName,
          lastName: user.lastName || "",
          username: user.username,
          roleId: user.roleId.toString(),
          groupId: user.groupId?.toString() || "",
          ext: user.ext?.toString() || "",
          teamLeaderId: user.teamLeaderId?.toString() || "",
        });
      } else {
        form.reset({
          firstName: "",
          lastName: "",
          username: "",
          password: "" as any,
          roleId: "",
          groupId: "",
          ext: "",
          teamLeaderId: "",
        } as any);
      }
      
      setTeamLeaderSearch("");

      // Fetch roles and groups in parallel
      Promise.all([
        settingsService.getRoles().then(setRoles),
        settingsService.getGroups().then(setGroups),
      ]).then(() => {
        if (isEditMode && user.groupId) {
          fetchTeamLeaders();
        }
      }).catch((error: any) => {
        toast.error(error.message || "Error al cargar los datos del formulario");
      }).finally(() => {
        setInitialLoading(false);
      });
    }
  }, [open, isEditMode]);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setLoading(true);
    try {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName || undefined,
        username: values.username,
        roleId: parseInt(values.roleId),
        groupId: values.groupId ? parseInt(values.groupId) : null,
        ext: values.ext || null,
        teamLeaderId: values.teamLeaderId ? parseInt(values.teamLeaderId) : null,
      };

      if (isEditMode) {
        await userService.updateUser(user.id, payload);
        toast.success("Usuario actualizado exitosamente");
      } else {
        await userService.createUser({
          ...payload,
          password: (values as any).password,
        });
        toast.success("Usuario creado exitosamente");
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el usuario`);
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    initialLoading,
    roles,
    groups,
    teamLeaders,
    teamLeaderSearch,
    setTeamLeaderSearch,
    isRoleRequiringGroupAndExt,
    shouldHideGroupFields,
    onSubmit: form.handleSubmit(onSubmit),
    isEditMode,
  };
};
