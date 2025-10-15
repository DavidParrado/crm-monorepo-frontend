import { useState, useEffect, useCallback } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/useDebounce";
import { API_URL } from "@/lib/constants";
import { toast } from "sonner";

interface User {
  id: number;
  firstName: string;
  lastName?: string;
  username: string;
}

interface UserSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  token: string;
  disabled?: boolean;
}

export function UserSelector({ value, onValueChange, token, disabled }: UserSelectorProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const selectedUser = users.find((user) => user.id.toString() === value);
  
  const fetchUsers = useCallback(async (pageNum: number, search: string, append = false) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "20",
      });
      
      if (search) {
        params.append("search", search);
      }
      
      const response = await fetch(`${API_URL}/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Error al cargar usuarios");
      }
      
      const data = await response.json();
      
      setUsers((prev) => append ? [...prev, ...data.data] : data.data);
      setTotal(data.total);
      setHasMore(data.data.length === 20 && users.length + data.data.length < data.total);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error al cargar los usuarios");
    } finally {
      setIsLoading(false);
    }
  }, [token, users.length]);
  
  // Initial load and search changes
  useEffect(() => {
    if (open) {
      setPage(1);
      setUsers([]);
      fetchUsers(1, debouncedSearch, false);
    }
  }, [open, debouncedSearch]);
  
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, debouncedSearch, true);
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedUser
            ? `${selectedUser.firstName} ${selectedUser.lastName || ""} (${selectedUser.username})`
            : "Selecciona un usuario..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar usuario..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading && page === 1 ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <CommandEmpty>
                  {searchQuery
                    ? "No se encontraron usuarios"
                    : "Escribe para buscar usuarios"}
                </CommandEmpty>
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.id.toString()}
                      onSelect={(currentValue) => {
                        onValueChange(currentValue === value ? "" : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === user.id.toString() ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>
                          {user.firstName} {user.lastName || ""}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user.username}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {hasMore && !isLoading && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={handleLoadMore}
                    >
                      Cargar más ({users.length} de {total})
                    </Button>
                  </div>
                )}
                {isLoading && page > 1 && (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
