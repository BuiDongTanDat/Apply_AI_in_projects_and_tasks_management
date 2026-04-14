"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { LabelProps } from "@/types/base.type";
import React from "react";

interface EnumSelectorProps {
  value?: string | string[];
  onChange?: (value: string | string[] | undefined) => void;
  multiple?: boolean;
  placeholder?: string;
  allowClear?: boolean;
  label: Record<string, LabelProps>;
  disabled?: boolean;
}

export const EnumSelector = React.memo(
  ({
    value,
    onChange,
    multiple = false,
    placeholder = "Select...",
    allowClear = true,
    label,
    disabled = false,
  }: EnumSelectorProps) => {
    const [open, setOpen] = useState(false);

    const values = Array.isArray(value) ? value : value ? [value] : [];

    const toggleValue = (val: string) => {
      if (multiple) {
        if (values.includes(val)) {
          onChange?.(values.filter((v) => v !== val));
        } else {
          onChange?.([...values, val]);
        }
      } else {
        onChange?.(val === value ? undefined : val);
        setOpen(false);
      }
    };

    const clear = () => onChange?.(multiple ? [] : undefined);

    const renderLabel = () => {
      if (!values.length) return placeholder;
      if (multiple) return values.map((v) => label[v].label).join(", ");
      return label[values[0]].label;
    };

    return (
      <div className="w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between",
                !values.length && "text-muted-foreground"
              )}
              disabled={disabled}
            >
              <span className="truncate font-normal">{renderLabel()}</span>
              <div className="flex items-center gap-1">
                {allowClear && values.length > 0 && (
                  <X
                    className="h-4 w-4 opacity-70 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      clear();
                    }}
                  />
                )}
                <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[600px] p-0">
            <Command>
              <CommandInput placeholder="Search..." />
              <CommandEmpty>Not found</CommandEmpty>
              <CommandGroup>
                {Object.entries(label).map(([key, label]) => {
                  console.log(label);
                  return (
                    <CommandItem
                      key={key}
                      onSelect={() => toggleValue(key as string)}
                      className="text-sm cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          values.includes(key as string)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {label.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);
