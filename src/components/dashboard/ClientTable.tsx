import { Users, Eye, Trash2 } from "lucide-react";
import { Client } from "@/types/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientTableProps {
  clients: Client[];
  isLoading: boolean;
  selectedRows: number[];
  hasActiveFilters: boolean;
  debouncedSearch: string;
  isAdmin: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: number, checked: boolean) => void;
  onViewDetail: (clientId: number) => void;
  onDelete: (clientId: number) => void;
}

export function ClientTable({
  clients,
  isLoading,
  selectedRows,
  hasActiveFilters,
  debouncedSearch,
  isAdmin,
  onSelectAll,
  onSelectRow,
  onViewDetail,
  onDelete,
}: ClientTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={clients.length > 0 && selectedRows.length === clients.length}
                onCheckedChange={onSelectAll}
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
                      onSelectRow(client.id, checked as boolean)
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
                      onClick={() => onViewDetail(client.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver detalle
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(client.id)}
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
  );
}
