import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { SuperAdminUser } from "@/types/tenant";
import { useSuperAdminPermissions } from "@/hooks/useSuperAdminPermissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface TeamTableProps {
  team: SuperAdminUser[];
  isLoading: boolean;
  onEdit: (member: SuperAdminUser) => void;
  onDelete: (member: SuperAdminUser) => void;
}

const getRoleBadgeStyles = (role: string) => {
  switch (role) {
    case 'ROOT':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    case 'ADMIN':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    case 'SUPPORT':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    default:
      return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'ROOT':
      return 'Root';
    case 'ADMIN':
      return 'Admin';
    case 'SUPPORT':
      return 'Soporte';
    default:
      return role;
  }
};

export const TeamTable = ({
  team,
  isLoading,
  onEdit,
  onDelete,
}: TeamTableProps) => {
  const { canManageTeam, user: currentUser } = useSuperAdminPermissions();

  if (isLoading) {
    return (
      <Card className="bg-white border-slate-200">
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 bg-slate-100" />
          ))}
        </div>
      </Card>
    );
  }

  if (team.length === 0) {
    return (
      <Card className="bg-white border-slate-200">
        <div className="p-12 text-center">
          <p className="text-slate-700">No hay miembros del equipo</p>
          <p className="text-sm text-slate-700 mt-1">
            Agrega el primer miembro para comenzar
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200 hover:bg-transparent">
            <TableHead className="text-slate-500">Nombre</TableHead>
            <TableHead className="text-slate-500">Email</TableHead>
            <TableHead className="text-slate-500">Rol</TableHead>
            <TableHead className="text-slate-500">Estado</TableHead>
            <TableHead className="text-slate-500 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {team.map((member) => {
            const isCurrentUser = currentUser?.id === member.id;
            
            return (
              <TableRow
                key={member.id}
                className="border-slate-200 hover:bg-slate-50"
              >
                <TableCell className="font-medium text-slate-700">
                  {member.firstName} {member.lastName}
                  {isCurrentUser && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Tú
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-slate-600">
                  {member.email}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getRoleBadgeStyles(member.role)}
                  >
                    {getRoleLabel(member.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={member.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className={
                      member.status === 'ACTIVE'
                        ? 'bg-success/10 text-success border-success/20'
                        : 'bg-slate-200 text-slate-600 border-slate-300'
                    }
                  >
                    {member.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {canManageTeam && !isCurrentUser && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-600 hover:text-slate-100 hover:bg-slate-800"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-white border-slate-200"
                      >
                        <DropdownMenuItem
                          onClick={() => onEdit(member)}
                          className="text-slate-800 focus:text-slate-100 focus:bg-slate-800"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(member)}
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
};
