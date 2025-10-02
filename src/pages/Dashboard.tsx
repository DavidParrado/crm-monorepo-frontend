import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Eye, Upload } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import type { Client } from "@/types/client";
import { ImportUploadModal } from "@/components/imports/ImportUploadModal";

export default function Dashboard() {
  const { token, user } = useAuthStore();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const limit = 10;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['clients', page, search],
    queryFn: async () => {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const response = await fetch(`${API_URL}/clients?page=${page}&limit=${limit}${searchParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al cargar clientes');
      return response.json() as Promise<{ data: Client[]; total: number }>;
    },
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  const renderPagination = () => {
    const pages = [];
    const showEllipsisStart = page > 3;
    const showEllipsisEnd = page < totalPages - 2;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, 5);
        if (showEllipsisEnd) pages.push(-1);
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        if (showEllipsisStart) pages.push(-1);
        pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1);
        if (showEllipsisStart) pages.push(-1);
        pages.push(page - 1, page, page + 1);
        if (showEllipsisEnd) pages.push(-2);
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Lista de clientes del sistema</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Clientes</CardTitle>
              <CardDescription>
                Lista de todos los clientes del sistema
              </CardDescription>
            </div>
            {user?.role.name === 'Administrador' && (
              <Button onClick={() => setIsImportModalOpen(true)} variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Importar CSV
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Buscar clientes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No hay clientes
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      {client.firstName} {client.lastName}
                    </TableCell>
                    <TableCell>{client.email || '-'}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {client.status?.name || 'Sin estado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {client.group?.name || 'Sin grupo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/clients/${client.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => page > 1 && setPage(page - 1)}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {renderPagination().map((pageNum, idx) => (
                  <PaginationItem key={idx}>
                    {pageNum === -1 || pageNum === -2 ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => setPage(pageNum)}
                        isActive={pageNum === page}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => page < totalPages && setPage(page + 1)}
                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      <ImportUploadModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
