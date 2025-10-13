import React from "react"
import { NodeProps } from "reactflow"
import { BaseNode } from "./BaseNode"
import { Globe } from "lucide-react"
import { useRunStore } from "@/lib/stores/run-store"
import { HttpRequestPreview } from "./HttpRequestPreview"

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
      <HttpRequestPreview nodeId={id} nodeData={data} />
    </BaseNode>
  )
}

