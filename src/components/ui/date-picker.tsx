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
  const [month, setMonth] = React.useState<Date>(selectedDate ?? new Date())

  React.useEffect(() => {
    if (selectedDate) setMonth(selectedDate)
  }, [currentValue])

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
          <Calendar mode="single" selected={selectedDate} month={month} onMonthChange={setMonth} onSelect={handleSelect} />
        </PopoverContent>
      </Popover>
    </>
  )
}

export { DatePicker, YearPicker }

type YearPickerProps = Omit<
  React.ComponentProps<"button">,
  "defaultValue" | "value" | "onChange"
> & {
  name?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  min?: number
  max?: number
}

function YearPicker({
  className,
  name,
  value,
  defaultValue,
  onValueChange,
  disabled,
  min = 1990,
  max = new Date().getFullYear(),
  ...props
}: YearPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "")
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  React.useEffect(() => {
    if (!isControlled) {
      setInternalValue(defaultValue ?? "")
    }
  }, [defaultValue, isControlled])

  const years = React.useMemo(
    () => Array.from({ length: max - min + 1 }, (_, i) => max - i),
    [min, max]
  )

  const selectedRef = React.useRef<HTMLButtonElement>(null)
  const gridRef = React.useRef<HTMLDivElement>(null)

  function handleSelect(year: number) {
    const next = String(year)
    if (!isControlled) setInternalValue(next)
    onValueChange?.(next)
    setOpen(false)
  }

  return (
    <div>
      {name && (
        <input type="hidden" name={name} value={currentValue ?? ""} readOnly />
      )}
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (next) {
            requestAnimationFrame(() => {
              const el = selectedRef.current
              const container = gridRef.current
              if (el && container) {
                container.scrollTop = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2
              }
            })
          }
        }}
      >
        <PopoverTrigger
          type="button"
          disabled={disabled}
          data-slot="year-picker"
          className={cn(
            "flex h-8 w-full min-w-0 items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-left text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30",
            !currentValue && "text-muted-foreground",
            className
          )}
          {...props}
        >
          <CalendarIcon className="size-4 text-muted-foreground" />
          <span className="truncate">{currentValue || ""}</span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div ref={gridRef} className="grid grid-cols-4 gap-1 max-h-60 overflow-y-auto">
            {years.map((y) => {
              const isSelected = currentValue === String(y)
              return (
                <button
                  key={y}
                  ref={isSelected ? selectedRef : undefined}
                  type="button"
                  onClick={() => handleSelect(y)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary"
                  )}
                >
                  {y}
                </button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}