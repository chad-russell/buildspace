import React from "react"
import { NodeProps } from "reactflow"
import { BaseNode } from "./BaseNode"
import { Globe } from "lucide-react"
import { useRunStore } from "@/lib/stores/run-store"

export function HttpRequestNode({ data, selected, id }: NodeProps) {
  const nodeState = useRunStore((s) => s.nodes[id])
  return (
    <BaseNode
      title={data.label || "HTTP Request"}
      selected={selected}
      icon={<Globe className="w-4 h-4" />}
      color="bg-blue-500"
      status={(nodeState?.state || "idle") as any}
      durationMs={nodeState?.durationMs}
      nodeId={id}
    >
      <div className="text-xs text-gray-600">
        {data.url ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {data.method || "GET"}
              </span>
            </div>
            <div className="text-[10px] break-all">{data.url}</div>
          </>
        ) : (
          <div className="text-gray-400 italic">No URL configured</div>
        )}
      </div>
    </BaseNode>
  )
}

