import { useState, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DynamicIcon } from "./dynamic-icon";
import { Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconSelectorProps {
  value?: string;
  onSelect: (iconName: string) => void;
  label?: string;
}

export function IconSelector({ value, onSelect, label }: IconSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get all available icon names from lucide-react
  const allIconNames = useMemo(() => {
    return Object.keys(dynamicIconImports).sort();
  }, []);

  // Filter icons based on search query
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) return allIconNames;
    
    const query = searchQuery.toLowerCase();
    return allIconNames.filter((name) => 
      name.toLowerCase().includes(query)
    );
  }, [allIconNames, searchQuery]);

  // Setup virtualizer for performance
  const parentRef = useMemo(() => ({ current: null as HTMLDivElement | null }), []);

  const virtualizer = useVirtualizer({
    count: filteredIcons.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  const handleIconSelect = (iconName: string) => {
    onSelect(iconName);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start"
          >
            {value ? (
              <div className="flex items-center gap-2">
                <DynamicIcon name={value} size={20} />
                <span>{value}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Seleccionar icono...</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar icono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div
            ref={parentRef as any}
            className="h-[300px] overflow-y-auto"
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const iconName = filteredIcons[virtualRow.index];
                const isSelected = value === iconName;
                
                return (
                  <button
                    key={virtualRow.key}
                    onClick={() => handleIconSelect(iconName)}
                    className={cn(
                      "absolute left-0 top-0 w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors",
                      isSelected && "bg-accent"
                    )}
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <DynamicIcon name={iconName} size={24} />
                    <span className="text-sm flex-1 text-left">{iconName}</span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>
          
          {filteredIcons.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No se encontraron iconos
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
