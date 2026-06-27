import * as React from "react"
import { Calendar, CalendarClock, Clock } from "lucide-react"

import { cn } from "@/lib/utils"

const PICKER_TYPES = new Set(["datetime-local", "date", "time"])

const pickerIconClass =
  "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:z-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const inputClassName = cn(
      "flex h-10 w-full rounded-none border-2 border-input bg-background px-3 py-1 text-base text-foreground transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      className
    )

    if (type && PICKER_TYPES.has(type)) {
      const Icon = type === "time" ? Clock : type === "date" ? Calendar : CalendarClock

      return (
        <div className="relative">
          <input
            type={type}
            className={cn(inputClassName, "pr-10", pickerIconClass)}
            ref={ref}
            {...props}
          />
          <Icon
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
        </div>
      )
    }

    return (
      <input
        type={type}
        className={inputClassName}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
