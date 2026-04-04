"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-fit p-2", className)}
      classNames={{
        root: "w-fit",
        months: "flex flex-col",
        month: "space-y-2",
        month_caption: "relative flex items-center justify-center px-8",
        caption_label: "text-sm font-semibold",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous:
          "inline-flex size-7 items-center justify-center rounded-md border border-input bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        button_next:
          "inline-flex size-7 items-center justify-center rounded-md border border-input bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        month_grid: "mt-2",
        weekdays: "flex",
        weekday: "w-8 text-center text-xs font-semibold text-muted-foreground",
        weeks: "space-y-1",
        week: "flex",
        day: "size-8 p-0 text-center",
        day_button:
          "inline-flex size-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) =>
          orientation === "left" ? (
            <ChevronLeftIcon className={cn("size-4", chevronClassName)} {...chevronProps} />
          ) : (
            <ChevronRightIcon className={cn("size-4", chevronClassName)} {...chevronProps} />
          ),
        ...components,
      }}
      {...props}
    />
  )
}

export { Calendar }