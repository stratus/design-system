"use client"

import * as React from "react"
import { cn } from "./utils"

interface ProgressProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
  colorScheme?: "default" | "auto"
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, max = 100, className, showLabel = false, colorScheme = "default" }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))

    let barColor = "bg-primary"
    if (colorScheme === "auto") {
      if (percentage < 50) {
        barColor = "bg-success"
      } else if (percentage < 80) {
        barColor = "bg-warning"
      } else {
        barColor = "bg-error"
      }
    }

    return (
      <div ref={ref} className={cn("w-full", className)}>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-300 ease-in-out", barColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="text-xs text-muted-foreground mt-1">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
export type { ProgressProps }
