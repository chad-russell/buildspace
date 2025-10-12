import React from "react"
import { NodeProps } from "reactflow"
import { BaseNode } from "./BaseNode"
import { Eye } from "lucide-react"
import { useRunStore } from "@/lib/stores/run-store"
import { JsonComposer } from "@/components/json/JsonComposer"

export function InspectNode({ data, selected, id }: NodeProps) {
  const nodeState = useRunStore((s) => s.nodes[id])
  const status = nodeState?.state || "idle"
  return (
    <BaseNode
      title={data.label || "Inspect"}
      selected={selected}
      icon={<Eye className="w-4 h-4" />}
      showSourceHandle={false}
      color="bg-orange-500"
      status={status as any}
      durationMs={nodeState?.durationMs}
      nodeId={id}
    >
      {status === "idle" && (
        <div className="text-xs text-gray-400 italic">Visualizes input data</div>
      )}
      {nodeState?.preview !== undefined && (
        <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded max-h-40 overflow-auto nopan nodrag">
          <JsonComposer value={nodeState.preview} readOnly ownerNodeId={id} />
        </div>
      )}
    </BaseNode>
  )
}

