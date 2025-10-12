import React from "react"
import { NodeProps } from "reactflow"
import { BaseNode } from "./BaseNode"
import { Filter } from "lucide-react"
import { useRunStore } from "@/lib/stores/run-store"

export function SelectNode({ data, selected, id }: NodeProps) {
  const nodeState = useRunStore((s) => s.nodes[id])
  return (
    <BaseNode
      title={data.label || "Select"}
      selected={selected}
      icon={<Filter className="w-4 h-4" />}
      color="bg-purple-500"
      status={(nodeState?.state || "idle") as any}
      durationMs={nodeState?.durationMs}
      nodeId={id}
    >
      <div className="text-xs text-gray-600">
        {data.fields && data.fields.length > 0 ? (
          <>
            <div className="font-medium mb-1">Selected Fields:</div>
            <div className="space-y-0.5">
              {data.fields.slice(0, 3).map((field: string, idx: number) => (
                <div key={idx} className="text-[10px] bg-purple-50 px-2 py-0.5 rounded">
                  {field}
                </div>
              ))}
              {data.fields.length > 3 && (
                <div className="text-[10px] text-gray-400">
                  +{data.fields.length - 3} more
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-gray-400 italic">No fields selected</div>
        )}
      </div>
    </BaseNode>
  )
}

