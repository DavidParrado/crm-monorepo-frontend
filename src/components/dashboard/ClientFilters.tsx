import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterOptions } from "@/types/filters";

interface ClientFiltersProps {
  filterOptions: FilterOptions;
  selectedCountry: string;
  selectedCampaign: string;
  selectedStatus: string;
  selectedUser: string;
  selectedGroup: string;
  selectedManagement: string;
  canFilterByUser: boolean;
  canFilterByGroup: boolean;
  hasActiveFilters: boolean;
  onCountryChange: (value: string) => void;
  onCampaignChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onUserChange: (value: string) => void;
  onGroupChange: (value: string) => void;
  onManagementChange: (value: string) => void;
  onClearFilters: () => void;
}

export function ClientFilters({
  filterOptions,
  selectedCountry,
  selectedCampaign,
  selectedStatus,
  selectedUser,
  selectedGroup,
  selectedManagement,
  canFilterByUser,
  canFilterByGroup,
  hasActiveFilters,
  onCountryChange,
  onCampaignChange,
  onStatusChange,
  onUserChange,
  onGroupChange,
  onManagementChange,
  onClearFilters,
}: ClientFiltersProps) {
  return (
    <div className="mt-4 p-4 border rounded-lg bg-muted/30 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Country Filter */}
        {filterOptions.countries && filterOptions.countries.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">País</label>
            <Select value={selectedCountry} onValueChange={onCountryChange}>
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
            <Select value={selectedCampaign} onValueChange={onCampaignChange}>
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
            <Select value={selectedStatus} onValueChange={onStatusChange}>
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
            <Select value={selectedUser} onValueChange={onUserChange}>
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
            <Select value={selectedGroup} onValueChange={onGroupChange}>
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

        {/* Management Filter */}
        {filterOptions.managements && filterOptions.managements.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Última Gestión</label>
            <Select value={selectedManagement} onValueChange={onManagementChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las gestiones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {filterOptions.managements.map((management) => (
                  <SelectItem key={management.id} value={management.id.toString()}>
                    {management.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
