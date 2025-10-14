import React, { useEffect, useState } from "react"
import { Handle, Position } from "reactflow"
import { cn } from "@/lib/utils"

export interface NodeHandle {
  type: "source" | "target"
  id?: string
  position: Position
  label?: string
  className?: string
  style?: React.CSSProperties
}

interface BaseNodeProps {
  children: React.ReactNode
  selected?: boolean
  title: string
  icon?: React.ReactNode
  showSourceHandle?: boolean
  showTargetHandle?: boolean
  handles?: NodeHandle[]
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
  handles,
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

  // If handles prop is provided, use it; otherwise fall back to legacy boolean props
  const renderHandles = handles || []
  const useLegacyHandles = !handles

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 bg-white shadow-md min-w-[200px] transition-all group",
        selected ? "border-blue-500" : "border-gray-300",
        status === "running" && "animate-pulse",
        status === "success" && "border-green-500",
        status === "error" && "border-red-500",
        isHoveredByRef && "ring-4 ring-blue-300 ring-opacity-50 shadow-xl scale-105"
      )}
    >
      {/* Legacy single target handle */}
      {useLegacyHandles && showTargetHandle && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-gray-400 transition-transform duration-150 hover:scale-110 hover:ring-2 hover:ring-blue-300"
        />
      )}

      {/* New multi-handle system */}
      {renderHandles.map((handle, idx) => {
        const handleId = handle.id || `${handle.type}-${idx}`
        const defaultClassName = "w-3 h-3 !bg-gray-400 transition-transform duration-150 hover:scale-110 hover:ring-2 hover:ring-blue-300"
        
        return (
          <>
            <Handle
              key={`${handleId}-handle`}
              type={handle.type}
              id={handleId}
              position={handle.position}
              className={handle.className || defaultClassName}
              style={handle.style}
            />
            {handle.label && (
              <div
                key={`${handleId}-label`}
                className={cn(
                  "absolute text-xs font-medium text-gray-600 whitespace-nowrap pointer-events-none",
                  handle.position === Position.Right && "left-full ml-2",
                  handle.position === Position.Left && "right-full mr-2",
                  handle.position === Position.Top && "bottom-full mb-2",
                  handle.position === Position.Bottom && "top-full mt-2"
                )}
                style={{
                  top:
                    handle.style?.top ||
                    (handle.position === Position.Right || handle.position === Position.Left
                      ? "50%"
                      : undefined),
                  transform:
                    handle.position === Position.Right || handle.position === Position.Left
                      ? "translateY(-50%)"
                      : undefined,
                }}
              >
                {handle.label}
              </div>
            )}
          </>
        )
      })}

      <div className={cn("px-4 py-2 rounded-t-md text-white font-medium flex items-center gap-2", color)}>
        {icon}
        <span>{title}</span>
        {durationMs !== undefined && (
          <span className="ml-auto text-xs opacity-80">{durationMs}ms</span>
        )}
      </div>

      <div className="p-4">{children}</div>

      {/* Legacy single source handle */}
      {useLegacyHandles && showSourceHandle && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 !bg-gray-400 transition-transform duration-150 hover:scale-110 hover:ring-2 hover:ring-blue-300"
          />
          {/* Hover-only caption near the default output */}
          <div
            className="absolute top-1/2 left-full -translate-y-1/2 ml-2 text-xs text-gray-600 opacity-0 pointer-events-none group-hover:opacity-100"
          >
            Output
          </div>
        </>
      )}
    </div>
  )
}

