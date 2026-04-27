"use client"

import * as React from "react"
import { cn } from "./utils"
import { Button } from "./Button"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 mx-4 w-full max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto bg-surface-container border border-border rounded-md shadow-lg">
        {children}
      </div>
    </div>
  )
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

export function DialogContent({ children, className }: DialogContentProps) {
  return <div className={cn("p-6", className)}>{children}</div>
}

interface DialogHeaderProps {
  children: React.ReactNode
  onClose?: () => void
}

export function DialogHeader({ children, onClose }: DialogHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex-1">{children}</div>
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="shrink-0"
          aria-label="Close dialog"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Button>
      )}
    </div>
  )
}

interface DialogTitleProps {
  children: React.ReactNode
}

export function DialogTitle({ children }: DialogTitleProps) {
  return <h2 className="text-lg font-semibold text-foreground">{children}</h2>
}

interface DialogDescriptionProps {
  children: React.ReactNode
}

export function DialogDescription({ children }: DialogDescriptionProps) {
  return <p className="text-sm text-muted-foreground mt-1">{children}</p>
}

interface DialogFooterProps {
  children: React.ReactNode
}

export function DialogFooter({ children }: DialogFooterProps) {
  return <div className="flex justify-end gap-2 mt-6">{children}</div>
}
