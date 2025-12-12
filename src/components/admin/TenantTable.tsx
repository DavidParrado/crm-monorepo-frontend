import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Pencil, Trash2, Key, RotateCcw, Flame, Eye } from "lucide-react";
import { Tenant } from "@/types/tenant";
import { TenantTab } from "@/hooks/useTenants";
import { useSuperAdminPermissions } from "@/hooks/useSuperAdminPermissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

interface TenantTableProps {
  tenants: Tenant[];
  isLoading: boolean;
  activeTab: TenantTab;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
  onResetPassword: (tenant: Tenant) => void;
  onRestore: (tenant: Tenant) => void;
  onHardDelete: (tenant: Tenant) => void;
}

export const TenantTable = ({
  tenants,
  isLoading,
  activeTab,
  onEdit,
  onDelete,
  onResetPassword,
  onRestore,
  onHardDelete,
}: TenantTableProps) => {
  const navigate = useNavigate();
  const { canEditTenants, canSoftDelete, canResetPassword, canRestore, canHardDelete } = useSuperAdminPermissions();
  const isTrashView = activeTab === 'trash';

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

  if (tenants.length === 0) {
    return (
      <Card className="bg-white border-slate-200">
        <div className="p-12 text-center">
          <p className="text-slate-700">
            {isTrashView ? 'La papelera está vacía' : 'No hay tenants registrados'}
          </p>
          <p className="text-sm text-slate-700 mt-1">
            {isTrashView
              ? 'Los tenants eliminados aparecerán aquí'
              : 'Crea tu primer tenant para comenzar'}
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
            <TableHead className="text-slate-500">Subdominio</TableHead>
            <TableHead className="text-slate-500">Estado</TableHead>
            <TableHead className="text-slate-500">
              {isTrashView ? 'Eliminado' : 'Creado'}
            </TableHead>
            <TableHead className="text-slate-500 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.map((tenant) => (
            <TableRow
              key={tenant.id}
              className="border-slate-200 hover:bg-slate-50"
            >
              <TableCell className="font-medium text-slate-700">
                {tenant.name}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className="bg-slate-200 hover:bg-slate-300 text-slate-600 font-mono text-xs"
                >
                  {tenant.subdomain}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={tenant.status === 'ACTIVE' ? 'default' : 'destructive'}
                  className={
                    tenant.status === 'ACTIVE'
                      ? 'bg-success/10 text-success border-success/20'
                      : 'bg-destructive/10 text-destructive border-destructive/20'
                  }
                >
                  {tenant.status === 'ACTIVE' ? 'Activo' : 'Suspendido'}
                </Badge>
              </TableCell>
              <TableCell className="text-slate-600 text-sm">
                {format(
                  new Date(isTrashView && tenant.deletedAt ? tenant.deletedAt : tenant.createdAt),
                  "dd MMM yyyy",
                  { locale: es }
                )}
              </TableCell>
              <TableCell className="text-right">
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
                    {isTrashView ? (
                      // Trash view actions
                      <>
                        {canRestore && (
                          <DropdownMenuItem
                            onClick={() => onRestore(tenant)}
                            className="text-slate-800 focus:text-slate-100 focus:bg-slate-800"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restaurar
                          </DropdownMenuItem>
                        )}
                        {canHardDelete && (
                          <>
                            <DropdownMenuSeparator className="bg-slate-200" />
                            <DropdownMenuItem
                              onClick={() => onHardDelete(tenant)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Flame className="h-4 w-4 mr-2" />
                              Eliminar Permanentemente
                            </DropdownMenuItem>
                          </>
                        )}
                      </>
                    ) : (
                      // Active view actions
                      <>
                        <DropdownMenuItem
                          onClick={() => navigate(`/admin/tenants/${tenant.id}`)}
                          className="text-slate-800 focus:text-slate-100 focus:bg-slate-800"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
                        {canEditTenants && (
                          <DropdownMenuItem
                            onClick={() => onEdit(tenant)}
                            className="text-slate-800 focus:text-slate-100 focus:bg-slate-800"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                        )}
                        {canResetPassword && (
                          <DropdownMenuItem
                            onClick={() => onResetPassword(tenant)}
                            className="text-slate-800 focus:text-slate-100 focus:bg-slate-800"
                          >
                            <Key className="h-4 w-4 mr-2" />
                            Restablecer Contraseña
                          </DropdownMenuItem>
                        )}
                        {canSoftDelete && (
                          <>
                            <DropdownMenuSeparator className="bg-slate-200" />
                            <DropdownMenuItem
                              onClick={() => onDelete(tenant)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Mover a Papelera
                            </DropdownMenuItem>
                          </>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
