import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Tenant } from "@/types/tenant";
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

interface TenantTableProps {
  tenants: Tenant[];
  isLoading: boolean;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
}

export const TenantTable = ({
  tenants,
  isLoading,
  onEdit,
  onDelete,
}: TenantTableProps) => {
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
          <p className="text-slate-700">No hay tenants registrados</p>
          <p className="text-sm text-slate-700 mt-1">
            Crea tu primer tenant para comenzar
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
            <TableHead className="text-slate-500">Creado</TableHead>
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
                {format(new Date(tenant.createdAt), "dd MMM yyyy", { locale: es })}
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
                    <DropdownMenuItem
                      onClick={() => onEdit(tenant)}
                      className="text-slate-800 focus:text-slate-100 focus:bg-slate-800"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(tenant)}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
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
