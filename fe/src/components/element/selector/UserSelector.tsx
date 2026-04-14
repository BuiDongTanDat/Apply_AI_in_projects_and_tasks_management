"use client";

import { useMemo, useState, useEffect } from "react";
import { Loader2, UserIcon, Check, X } from "lucide-react";
import { useUser } from "@/hooks/data/use-user";
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

import type { User } from "@/types/user.type";
import type { Query } from "@/api/axiosInstance";
import { Tag } from "antd";
import { useAppSelector } from "@/store/hook";

interface UserSelectorProps {
  value?: User | number | (User | number)[] | null;
  query?: Query;
  disabled?: boolean;
  multiple?: boolean;
  takeObject?: boolean;
  onSelect?: (value: any) => void;
  placeholder?: string;
  notIncludeIds?: number[];
  takeAll?: boolean;
}

export const UserSelector = ({
  value,
  query,
  disabled,
  multiple = false,
  takeObject = false,
  onSelect,
  placeholder = "Select user",
  notIncludeIds,
  takeAll = false,
}: UserSelectorProps) => {
  const { team } = useAppSelector((state) => state.selectedTeam);

  const { data, loading } = useUser({
    initQuery: query || { page: 1, limit: 20, teamId: takeAll ? undefined : team?.id },
  });

  const options = useMemo(
    () => data.filter((u) => !notIncludeIds?.includes(u.id)),
    [data, notIncludeIds],
  );

  const [open, setOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState<
    User[] | User | null
  >(null);

  // Đồng bộ với value bên ngoài nếu có
  useEffect(() => {
    const converted = (() => {
      if (multiple && Array.isArray(value)) {
        return value
          .map((val) =>
            typeof val === "number" ? options.find((u) => u.id === val) : val,
          )
          .filter((v): v is User => v !== undefined);
      } else {
        if (typeof value === "number") {
          return options.find((u) => u.id === value) || null;
        } else if (value && typeof value === "object") {
          return value;
        }
      }
      return null;
    })();
    //@ts-ignore
    setInternalSelected(converted);
  }, [value, options, multiple]);

  const selectedList = internalSelected;

  const updateSelection = (newList: User[] | User | null) => {
    setInternalSelected(newList);
    // 🔧 CHỈ TRẢ MẢNG NẾU multiple = true
    if (multiple && Array.isArray(newList)) {
      onSelect?.(takeObject ? newList : newList.map((u) => u.id));
    } else if (!multiple && !Array.isArray(newList)) {
      const selected = newList;
      onSelect?.(takeObject ? selected : selected?.id);
    }
  };

  const handleSelect = (user: User) => {
    if (multiple && Array.isArray(selectedList)) {
      const exists = selectedList.some((u) => u.id === user.id);
      const newList = exists
        ? selectedList.filter((u) => u.id !== user.id)
        : [...selectedList, user];
      updateSelection(newList);
    } else {
      updateSelection(user);
      setOpen(false);
    }
  };

  const handleRemove = (id: number) => {
    if (multiple && Array.isArray(selectedList)) {
      updateSelection(selectedList.filter((u) => u.id !== id));
    } else {
      updateSelection(null);
    }
  };

  const renderValue = () => {
    if (Array.isArray(selectedList) && multiple) {
      if (Array.isArray(selectedList) && selectedList.length === 0)
        return <span className="text-muted-foreground">{placeholder}</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {selectedList.map((u) => (
            <Tag
              key={u.id}
              className="flex items-center gap-1 cursor-pointer !bg-blue-violet-600"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(u.id);
              }}
            >
              {u.name || u.email}
              <X className="w-3 h-3" />
            </Tag>
          ))}
        </div>
      );
    }
    if (Array.isArray(selectedList) && selectedList.length === 0)
      return <span className="text-muted-foreground">{placeholder}</span>;
    if (!selectedList)
      return <span className="text-muted-foreground">{placeholder}</span>;
    if (!Array.isArray(selectedList)) {
      return (
        <Badge
          key={selectedList?.id}
          className="flex items-center gap-1 cursor-pointer !bg-blue-violet-500"
          onClick={(e) => {
            e.stopPropagation();
            handleRemove(selectedList.id);
          }}
          color="#4038ca"
        >
          {selectedList.name || selectedList.email}
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
            multiple && "min-h-[38px] h-auto py-1",
          )}
          disabled={disabled}
        >
          {renderValue()}
          <UserIcon className="w-4 h-4 opacity-60 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandList>
            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
            {!loading && (
              <>
                <CommandEmpty>No users found</CommandEmpty>
                <ScrollArea className="max-h-[250px]">
                  <CommandGroup>
                    {options.map((u) => {
                      const isSelected = multiple
                        ? Array.isArray(selectedList) &&
                          selectedList.some((sel) => sel.id === u.id)
                        : !Array.isArray(selectedList) &&
                          selectedList?.id === u.id;
                      return (
                        <CommandItem
                          key={u.id}
                          onSelect={() => handleSelect(u)}
                        >
                          <div className="flex items-center justify-between w-full cursor-pointer">
                            <span>{u.email}</span>
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
