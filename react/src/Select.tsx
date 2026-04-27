"use client"

import * as React from "react"
import { cn } from "./utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1">
            {label}
          </label>
        )}
        <select
          className={cn(
            "flex h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error focus:ring-error",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-error mt-1">{error}</p>}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
