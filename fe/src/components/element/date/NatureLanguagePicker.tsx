"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip } from "antd";
import dayjs from "dayjs";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

interface NatureLanguagePickerProps {
  onChange?: (date: Date | number) => void;
}

export function NatureLanguagePicker({ onChange }: NatureLanguagePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("In 2 days");
  const [date, setDate] = React.useState<Date | undefined>(
    dayjs().add(2, "day").toDate()
  );
  const [month, setMonth] = React.useState<Date | undefined>(date);

  return (
    <div className="relative flex gap-2">
      <Input
        id="date"
        value={value}
        placeholder="Tomorrow or next week"
        className="bg-background pr-10 border-0 focus-visible:ring-0 w-36 text-xs shadow-xs"
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip title="Select date">
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2 !cursor-pointer px-0"
            >
              <CalendarIcon className="size-3.5 cursor-pointer" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
        </Tooltip>

        <PopoverContent className="w-auto overflow-hidden p-0" align="end">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            onSelect={(date) => {
              const unix = date
                ? dayjs(date).endOf("day").unix()
                : dayjs().unix();
              onChange?.(unix);
              console.log("Selected date:", date, unix);
              setDate(date);
              setValue(formatDate(date));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
