import { Search, X, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KanbanFilters as KanbanFiltersType } from "@/hooks/useKanbanFilters";

interface KanbanFiltersProps {
  filters: KanbanFiltersType;
  uniqueClients: Array<{ id: string; name: string }>;
  onClientChange: (clientId: string) => void;
  onChatStatusChange: (status: 'all' | 'open' | 'pending' | 'resolved' | 'none') => void;
  onUnreadToggle: (showUnread: boolean) => void;
  onSearchChange: (query: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const KanbanFilters = ({
  filters,
  uniqueClients,
  onClientChange,
  onChatStatusChange,
  onUnreadToggle,
  onSearchChange,
  onResetFilters,
  hasActiveFilters,
}: KanbanFiltersProps) => {
  return (
    <Card className="p-4 mb-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Filters</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-8 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-xs">Search Tasks</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by title, client..."
                value={filters.searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Client Filter */}
          <div className="space-y-2">
            <Label htmlFor="client" className="text-xs">Client</Label>
            <Select value={filters.clientId} onValueChange={onClientChange}>
              <SelectTrigger id="client">
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {uniqueClients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chat Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-xs">Chat Status</Label>
            <Select value={filters.chatStatus} onValueChange={onChatStatusChange}>
              <SelectTrigger id="status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="none">No Chat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Unread Messages Toggle */}
          <div className="space-y-2">
            <Label htmlFor="unread" className="text-xs flex items-center gap-2">
              <MessageCircle className="h-3 w-3" />
              Unread Only
            </Label>
            <div className="flex items-center h-10 px-3 rounded-md border border-input bg-background">
              <Switch
                id="unread"
                checked={filters.showUnreadOnly}
                onCheckedChange={onUnreadToggle}
              />
              <span className="ml-2 text-sm text-muted-foreground">
                {filters.showUnreadOnly ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-xs text-muted-foreground">Active:</span>
            {filters.clientId !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Client: {uniqueClients.find(c => c.id === filters.clientId)?.name}
              </Badge>
            )}
            {filters.chatStatus !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Status: {filters.chatStatus}
              </Badge>
            )}
            {filters.showUnreadOnly && (
              <Badge variant="secondary" className="text-xs">
                Unread Messages
              </Badge>
            )}
            {filters.searchQuery.trim() && (
              <Badge variant="secondary" className="text-xs">
                Search: "{filters.searchQuery}"
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
