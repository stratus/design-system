"use client"

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react"
import { createPortal } from "react-dom"

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  position?: "top" | "bottom"
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLSpanElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => {
      if (!triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({
        x: rect.left + rect.width / 2,
        y: position === "top" ? rect.top : rect.bottom,
      })
      setVisible(true)
    }, 300)
  }, [position])

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
  }, [])

  useEffect(() => {
    if (!visible) return
    const onScroll = () => setVisible(false)
    window.addEventListener("scroll", onScroll, true)
    return () => window.removeEventListener("scroll", onScroll, true)
  }, [visible])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <span
      ref={triggerRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      className="inline"
    >
      {children}
      {visible &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: coords.x,
              top: position === "top" ? coords.y - 6 : coords.y + 6,
              transform:
                position === "top"
                  ? "translate(-50%, -100%)"
                  : "translate(-50%, 0)",
              zIndex: 9999,
            }}
          >
            <div className="bg-surface-container-high text-foreground text-xs rounded-lg px-3 py-2 max-w-[260px] shadow-lg leading-relaxed">
              {content}
            </div>
          </div>,
          document.body
        )}
    </span>
  )
}
