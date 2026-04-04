"use client"

import * as React from "react"
import { format, isValid, parse } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DatePickerProps = Omit<
  React.ComponentProps<"button">,
  "defaultValue" | "value" | "onChange"
> & {
  name?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  hiddenInputDisabled?: boolean
}

function parseDate(value: string | undefined) {
  if (!value) return undefined

  const parsed = parse(value, "yyyy-MM-dd", new Date())
  return isValid(parsed) ? parsed : undefined
}

function DatePicker({
  className,
  name,
  value,
  defaultValue,
  onValueChange,
  disabled,
  hiddenInputDisabled,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "")
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  React.useEffect(() => {
    if (!isControlled) {
      setInternalValue(defaultValue ?? "")
    }
  }, [defaultValue, isControlled])

  const selectedDate = parseDate(currentValue)

  function handleSelect(nextDate: Date | undefined) {
    const nextValue = nextDate ? format(nextDate, "yyyy-MM-dd") : ""

    if (!isControlled) {
      setInternalValue(nextValue)
    }

    onValueChange?.(nextValue)
    setOpen(false)
  }

  return (
    <>
      {name && (
        <input
          type="hidden"
          name={name}
          value={currentValue ?? ""}
          disabled={hiddenInputDisabled ?? disabled}
          readOnly
        />
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          disabled={disabled}
          data-slot="date-picker"
          className={cn(
            "flex h-8 w-full min-w-0 items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-left text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
            !currentValue && "text-muted-foreground",
            className
          )}
          {...props}
        >
          <CalendarIcon className="size-4 text-muted-foreground" />
          <span className="truncate">{selectedDate ? format(selectedDate, "PPP") : ""}</span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={selectedDate} month={selectedDate} onSelect={handleSelect} />
        </PopoverContent>
      </Popover>
    </>
  )
}

export { DatePicker }