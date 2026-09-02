"use client";

import { DayPicker } from "react-day-picker";
import type { ComponentProps } from "react";
import "react-day-picker/style.css";
import { cn } from "@/lib/utils";

export function Calendar({
  className,
  ...props
}: ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous: "absolute left-1 h-7 w-7 rounded hover:bg-muted",
        button_next: "absolute right-1 h-7 w-7 rounded hover:bg-muted",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative",
        day_button: "h-9 w-9 rounded-md hover:bg-muted",
        selected: "bg-primary text-primary-foreground rounded-md",
        today: "bg-accent text-accent-foreground rounded-md",
        outside: "text-muted-foreground opacity-50",
      }}
      {...props}
    />
  );
}
