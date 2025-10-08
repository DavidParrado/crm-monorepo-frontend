import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Eye, Filter } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuthStore } from "@/store/authStore";
import { RoleEnum } from "@/types/role";
import { API_URL } from "@/lib/constants";
import { Client } from "@/types/client";
import { Status } from "@/types/status";
import { Group } from "@/types/group";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface FilterOptions {
  countries?: string[];
  campaigns?: string[];
  statuses?: Status[];
  assignedUsers?: { id: number; name: string }[];
  groups?: Group[];
}

interface ClientsResponse {
  data: Client[];
  total: number;
}

export default function Dashboard() {
  const { token, user } = useAuthStore();
  const navigate = useNavigate();
  
  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  
  // Filters
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [sortBy] = useState("createdAt");
  const [sortOrder] = useState<"ASC" | "DESC">("DESC");
  const [showFilters, setShowFilters] = useState(false);
  
  const debouncedSearch = useDebounce(searchQuery, 500);
  
  const totalPages = Math.ceil(total / limit);

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch(`${API_URL}/clients/filter-options`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Error al cargar opciones de filtro");

        const data = await response.json();
        setFilterOptions(data);
      } catch (error) {
        console.error("Error fetching filter options:", error);
        toast.error("Error al cargar las opciones de filtro");
      }
    };

    if (token) {
      fetchFilterOptions();
    }
  }, [token]);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
          sortBy,
          sortOrder,
        });

        if (debouncedSearch) params.append("search", debouncedSearch);
        if (selectedCountry && selectedCountry !== "all") params.append("country", selectedCountry);
        if (selectedCampaign && selectedCampaign !== "all") params.append("campaign", selectedCampaign);
        if (selectedStatus && selectedStatus !== "all") params.append("statusId", selectedStatus);
        if (selectedUser && selectedUser !== "all") params.append("assignedUserId", selectedUser);
        if (selectedGroup && selectedGroup !== "all") params.append("groupId", selectedGroup);

        const response = await fetch(`${API_URL}/clients?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Error al cargar clientes");

        const data: ClientsResponse = await response.json();
        setClients(data.data);
        setTotal(data.total);
        setSelectedRows([]);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Error al cargar los clientes");
        setClients([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchClients();
    }
  }, [
    token,
    currentPage,
    limit,
    debouncedSearch,
    selectedCountry,
    selectedCampaign,
    selectedStatus,
    selectedUser,
    selectedGroup,
    sortBy,
    sortOrder,
  ]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(clients.map((c) => c.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const clearFilters = () => {
    setSelectedCountry("all");
    setSelectedCampaign("all");
    setSelectedStatus("all");
    setSelectedUser("all");
    setSelectedGroup("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    (selectedCountry && selectedCountry !== "all") || 
    (selectedCampaign && selectedCampaign !== "all") || 
    (selectedStatus && selectedStatus !== "all") || 
    (selectedUser && selectedUser !== "all") || 
    (selectedGroup && selectedGroup !== "all");

  const userRole = user?.role?.name as RoleEnum;
  const canFilterByUser = userRole === RoleEnum.Admin || userRole === RoleEnum.TeamLeader;
  const canFilterByGroup = userRole === RoleEnum.Admin;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Vista general de tus clientes y actividades
        </p>
      </div>

      {/* Tabla de Clientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Clientes ({total})</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                placeholder="Buscar clientes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-64"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {[
                      selectedCountry !== "all" && selectedCountry,
                      selectedCampaign !== "all" && selectedCampaign,
                      selectedStatus !== "all" && selectedStatus,
                      selectedUser !== "all" && selectedUser,
                      selectedGroup !== "all" && selectedGroup
                    ].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/30 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Country Filter */}
                {filterOptions.countries && filterOptions.countries.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">País</label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los países" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {filterOptions.countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Campaign Filter */}
                {filterOptions.campaigns && filterOptions.campaigns.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Campaña</label>
                    <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las campañas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {filterOptions.campaigns.map((campaign) => (
                          <SelectItem key={campaign} value={campaign}>
                            {campaign}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Status Filter */}
                {filterOptions.statuses && filterOptions.statuses.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado</label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {filterOptions.statuses.map((status) => (
                          <SelectItem key={status.id} value={status.id.toString()}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* User Filter - Only for Admin and TeamLeader */}
                {canFilterByUser && filterOptions.assignedUsers && filterOptions.assignedUsers.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Asignado a</label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los usuarios" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {filterOptions.assignedUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Group Filter - Only for Admin */}
                {canFilterByGroup && filterOptions.groups && filterOptions.groups.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Grupo</label>
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los grupos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {filterOptions.groups.map((group) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Acciones masivas */}
          {selectedRows.length > 0 && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
              <span className="text-sm font-medium">
                {selectedRows.length} seleccionado{selectedRows.length > 1 ? "s" : ""}
              </span>
              <div className="flex gap-2 ml-auto">
                <Button size="sm" variant="outline">
                  Asignar
                </Button>
                <Button size="sm" variant="outline">
                  Desasignar
                </Button>
                <Button size="sm" variant="outline">
                  Exportar
                </Button>
                <Button size="sm" variant="destructive">
                  Eliminar
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={clients.length > 0 && selectedRows.length === clients.length}
                      onCheckedChange={handleSelectAll}
                      disabled={isLoading || clients.length === 0}
                    />
                  </TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Asignado a</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
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
                            handleSelectRow(client.id, checked as boolean)
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
          </div>

          {/* Paginación */}
          {!isLoading && clients.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * limit + 1}-
                {Math.min(currentPage * limit, total)} de {total} resultados
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {totalPages > 5 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(totalPages)}
                          isActive={currentPage === totalPages}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
