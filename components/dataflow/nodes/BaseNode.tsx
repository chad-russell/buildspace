import React, { useEffect, useState } from "react"
import { Handle, Position } from "reactflow"
import { cn } from "@/lib/utils"

interface BaseNodeProps {
  children: React.ReactNode
  selected?: boolean
  title: string
  icon?: React.ReactNode
  showSourceHandle?: boolean
  showTargetHandle?: boolean
  color?: string
  status?: "idle" | "running" | "success" | "error"
  durationMs?: number
  nodeId?: string
}

export function BaseNode({
  children,
  selected,
  title,
  icon,
  showSourceHandle = true,
  showTargetHandle = true,
  color = "bg-blue-500",
  status = "idle",
  durationMs,
  nodeId,
}: BaseNodeProps) {
  const [isHoveredByRef, setIsHoveredByRef] = useState(false)

  useEffect(() => {
    if (!nodeId) return
    
    const handleHover = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail.nodeId === nodeId) {
        setIsHoveredByRef(customEvent.detail.hovering)
      }
    }

    window.addEventListener('json-ref-hover', handleHover)
    return () => window.removeEventListener('json-ref-hover', handleHover)
  }, [nodeId])

  return (
    <div
      className={cn(
        "rounded-lg border-2 bg-white shadow-md min-w-[200px] transition-all",
        selected ? "border-blue-500" : "border-gray-300",
        status === "running" && "animate-pulse",
        status === "success" && "border-green-500",
        status === "error" && "border-red-500",
        isHoveredByRef && "ring-4 ring-blue-300 ring-opacity-50 shadow-xl scale-105"
      )}
    >
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-gray-400"
        />
      )}

      <div className={cn("px-4 py-2 rounded-t-md text-white font-medium flex items-center gap-2", color)}>
        {icon}
        <span>{title}</span>
        {durationMs !== undefined && (
          <span className="ml-auto text-xs opacity-80">{durationMs}ms</span>
        )}
      </div>

      <div className="p-4">{children}</div>

      {showSourceHandle && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-gray-400"
        />
      )}
    </div>
  )
}

