import React, { useState } from "react"
import { NodeProps } from "reactflow"
import { BaseNode } from "./BaseNode"
import { Edit3, Link2, Trash2 } from "lucide-react"
import { useRunStore } from "@/lib/stores/run-store"
import { useDataFlowStore } from "@/lib/stores/dataflow-store"
import { JsonComposer } from "@/components/json/JsonComposer"
import { isRef } from "@/lib/json/path"
import type { JsonPathRef } from "@/lib/types/dataflow"

export function SetValueNode({ data, selected, id }: NodeProps) {
  const nodeState = useRunStore((s) => s.nodes[id])
  const updateNodeData = useDataFlowStore((s) => s.updateNodeData)
  const ensureEdge = useDataFlowStore((s) => s.ensureEdge)

  return (
    <BaseNode
      title={data.label || "Set Value"}
      selected={selected}
      icon={<Edit3 className="w-4 h-4" />}
      showTargetHandle={true}
      color="bg-orange-500"
      status={(nodeState?.state || "idle") as any}
      durationMs={nodeState?.durationMs}
      nodeId={id}
    >
      <div className="text-xs space-y-3 w-64">
        <div className="font-medium text-gray-600">Set ___ to ___</div>
        
        {/* Target field (first blank) */}
        <div>
          <div className="text-[11px] text-gray-500 mb-1">Target (drag path reference here)</div>
          <TargetDropZone
            target={data.target}
            onTargetChange={(newTarget) => {
              updateNodeData(id, { target: newTarget })
              // If it's a reference, ensure edge exists
              if (isRef(newTarget)) {
                const ref = newTarget.$ref as JsonPathRef
                const sourceNodeId = ref[0]?.id
                if (sourceNodeId) {
                  ensureEdge(sourceNodeId, id)
                }
              }
            }}
          />
        </div>

        {/* Value field (second blank) */}
        <div>
          <div className="text-[11px] text-gray-500 mb-1">Value (literal or reference)</div>
          <div className="bg-gray-50 p-2 rounded nopan nodrag">
            <JsonComposer
              value={data.value ?? null}
              onChange={(next) => updateNodeData(id, { value: next })}
              ownerNodeId={id}
              onCreateReference={(src, dst) => ensureEdge(src, dst)}
            />
          </div>
        </div>
      </div>
    </BaseNode>
  )
}

interface TargetDropZoneProps {
  target: any
  onTargetChange: (newTarget: any) => void
}

function TargetDropZone({ target, onTargetChange }: TargetDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const onDragOver = (e: React.DragEvent) => {
    const hasJsonPath = e.dataTransfer.types.includes("application/x-json-path")
    if (!hasJsonPath) return
    
    e.preventDefault()
    setIsDragOver(true)
  }

  const onDragLeave = () => {
    setIsDragOver(false)
  }

  const onDrop = (e: React.DragEvent) => {
    const raw = e.dataTransfer.getData("application/x-json-path")
    if (!raw) return
    
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    try {
      const { path: sourcePath, nodeId: sourceNodeId } = JSON.parse(raw)
      
      // Validate that this is a path reference, not just a node
      if (!sourcePath || sourcePath.length === 0) {
        alert("Please drag a specific path within a node, not the entire node")
        return
      }
      
      if (sourceNodeId) {
        const ref = { $ref: [{ id: sourceNodeId }, ...sourcePath] }
        onTargetChange(ref)
      }
    } catch (err) {
      console.error("Failed to parse drop data:", err)
    }
  }

  // If target is set and is a reference, display it
  if (isRef(target)) {
    return <ReferenceDisplay reference={target} onClear={() => onTargetChange(null)} />
  }

  // Otherwise show drop zone
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`
        border-2 border-dashed rounded p-3 text-center text-xs
        transition-colors nopan nodrag
        ${isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50"}
      `}
    >
      {isDragOver ? (
        <span className="text-blue-600 font-medium">Drop here</span>
      ) : (
        <span className="text-gray-400 italic">Drag a path reference here</span>
      )}
    </div>
  )
}

interface ReferenceDisplayProps {
  reference: { $ref: JsonPathRef }
  onClear: () => void
}

function ReferenceDisplay({ reference, onClear }: ReferenceDisplayProps) {
  const [isHovered, setIsHovered] = useState(false)
  const ref = reference.$ref
  const sourceNodeId = ref[0]?.id
  const refPath = ref.slice(1)
  
  const formatPath = () => {
    const parts = refPath.map((seg) => 
      typeof seg === "number" ? `[${seg}]` : `.${seg}`
    ).join("")
    return `@${sourceNodeId}${parts}`
  }

  return (
    <div 
      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded text-[11px] font-medium nopan nodrag"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link2 className="w-3 h-3" />
      <span>{formatPath()}</span>
      {isHovered && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClear()
          }}
          className="text-red-500 hover:text-red-700 ml-1"
          title="Clear target"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

