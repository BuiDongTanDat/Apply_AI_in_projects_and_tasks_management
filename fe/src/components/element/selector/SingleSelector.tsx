"use client";

import { useMemo, useState, useEffect } from "react";
import { Loader2, Check, X, ChevronDown } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tag } from "antd";

interface SingleSelectorProps<T extends { id: number }> {
  value?: T | number | (T | number)[] | null;
  findAll: () => Promise<T[]>;
  findOne?: (id: number) => Promise<T | null>;
  disabled?: boolean;
  multiple?: boolean;
  takeObject?: boolean;
  onSelect?: (value: any) => void;
  placeholder?: string;
  notIncludeIds?: number[];
  searchPlaceholder?: string;
  emptyText?: string;
  getDisplayValue: (item: T) => string;
}

export const SingleSelector = <T extends { id: number }>({
  value,
  findAll,
  //   findOne,
  disabled,
  multiple = false,
  takeObject = false,
  onSelect,
  placeholder = "Select...",
  notIncludeIds,
  searchPlaceholder = "Search...",
  emptyText = "Not found",
  getDisplayValue,
}: SingleSelectorProps<T>) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState<T[] | T | null>(
    null
  );

  console.log(value);

  // Load data khi component mount
  useEffect(() => {
    try {
      setLoading(true);
      findAll().then(setData);
    } catch (error) {
      console.error("Failed to load data:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const options = useMemo(() => {
    if (notIncludeIds && notIncludeIds.length > 0) {
      return data.filter((item) => !notIncludeIds.includes(item.id));
    }
    return data;
  }, [data, notIncludeIds]);

  // Đồng bộ với value bên ngoài nếu có
  useEffect(() => {
    if (!value || data.length === 0) {
      if (!value) setInternalSelected(null);
      return;
    }
    if (multiple) {
      const ids = Array.isArray(value)
        ? (value as (T | number)[]).map((v) =>
            typeof v === "number" ? v : v.id
          )
        : [typeof value === "number" ? value : (value as T).id];
      setInternalSelected(data.filter((d) => ids.includes(d.id)));
    } else {
      const id = Array.isArray(value)
        ? typeof value[0] === "number"
          ? value[0]
          : (value[0] as T)?.id
        : typeof value === "number"
          ? value
          : (value as T).id;
      setInternalSelected(data.find((d) => d.id === id) ?? null);
    }
  }, [value, data]);

  const updateSelection = (newList: T[] | T | null) => {
    setInternalSelected(newList);
    // CHỈ TRẢ MẢNG NẾU multiple = true
    if (multiple && Array.isArray(newList)) {
      onSelect?.(takeObject ? newList : newList.map((item) => item.id));
    } else if (!multiple && !Array.isArray(newList)) {
      const selected = newList;

      onSelect?.(takeObject ? selected : selected?.id);
    }
  };

  const handleSelect = (item: T) => {
    if (multiple && Array.isArray(internalSelected)) {
      const exists = internalSelected.some((i) => i.id === item.id);
      const newList = exists
        ? internalSelected.filter((i) => i.id !== item.id)
        : [...internalSelected, item];
      updateSelection(newList);
    } else {
      updateSelection(item);
      setOpen(false);
    }
  };

  const handleRemove = (id: number) => {
    if (multiple && Array.isArray(internalSelected)) {
      updateSelection(internalSelected.filter((item) => item.id !== id));
    } else {
      updateSelection(null);
    }
  };

  const renderValue = () => {
    if (Array.isArray(internalSelected) && multiple) {
      if (Array.isArray(internalSelected) && internalSelected.length === 0)
        return <span className="text-muted-foreground">{placeholder}</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {internalSelected.map((item) => (
            <Tag
              key={item.id}
              className="flex items-center gap-1 cursor-pointer !bg-blue-violet-600"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(item.id);
              }}
            >
              {getDisplayValue(item)}
              <X className="w-3 h-3" />
            </Tag>
          ))}
        </div>
      );
    }
    if (Array.isArray(internalSelected) && internalSelected.length === 0)
      return <span className="text-muted-foreground">{placeholder}</span>;
    if (!internalSelected)
      return <span className="text-muted-foreground">{placeholder}</span>;
    if (!Array.isArray(internalSelected)) {
      return (
        <Badge
          key={internalSelected?.id}
          className="flex items-center gap-1 cursor-pointer !bg-blue-violet-500"
          onClick={(e) => {
            e.stopPropagation();
            handleRemove(internalSelected.id);
          }}
          color="#4038ca"
        >
          {getDisplayValue(internalSelected)}
          <X className="w-3 h-3" />
        </Badge>
      );
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between",
            disabled && "opacity-50 cursor-not-allowed",
            multiple && "min-h-[38px] h-auto py-1"
          )}
          disabled={disabled}
        >
          {renderValue()}
          <ChevronDown className="w-4 h-4 opacity-60 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-4 h-4 " />
              </div>
            )}
            {!loading && (
              <>
                <CommandEmpty>{emptyText}</CommandEmpty>
                <ScrollArea className="max-h-[250px]">
                  <CommandGroup>
                    {options.map((item) => {
                      const isSelected = multiple
                        ? Array.isArray(internalSelected) &&
                          internalSelected.some((sel) => sel.id === item.id)
                        : !Array.isArray(internalSelected) &&
                          internalSelected?.id === item.id;
                      return (
                        <CommandItem
                          key={item.id}
                          onSelect={() => handleSelect(item)}
                        >
                          <div className="flex items-center justify-between w-full cursor-pointer">
                            <span>{getDisplayValue(item)}</span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-primary" />
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </ScrollArea>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
