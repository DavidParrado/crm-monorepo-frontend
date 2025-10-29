import { useState, useEffect } from "react";
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
import { useUserSearch } from "@/hooks/useUserSearch";

interface UserSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  token: string | null;
  disabled?: boolean;
}

export function UserSelector({ value, onValueChange, disabled }: UserSelectorProps) {
  const [open, setOpen] = useState(false);
  const { users, isLoading, searchQuery, setSearchQuery, loadMore, hasMore, total, resetAndFetch } = useUserSearch();

  const selectedUser = users.find((user) => user.id.toString() === value);

  useEffect(() => {
    if (open) {
      resetAndFetch();
    }
  }, [open]);
  
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
            {isLoading ? (
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
                {hasMore && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={loadMore}
                    >
                      Cargar más ({users.length} de {total})
                    </Button>
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
