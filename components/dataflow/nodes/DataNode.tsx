import React from "react"
import { NodeProps } from "reactflow"
import { BaseNode } from "./BaseNode"
import { Database } from "lucide-react"
import { useRunStore } from "@/lib/stores/run-store"
import { JsonComposer } from "@/components/json/JsonComposer"
import { useDataFlowStore } from "@/lib/stores/dataflow-store"

export function DataNode({ data, selected, id }: NodeProps) {
  const nodeState = useRunStore((s) => s.nodes[id])
  const updateNodeData = useDataFlowStore((s) => s.updateNodeData)
  const ensureEdge = useDataFlowStore((s) => s.ensureEdge)
  return (
    <BaseNode
      title={data.label || "Data"}
      selected={selected}
      icon={<Database className="w-4 h-4" />}
      showTargetHandle={true}
      color="bg-green-500"
      status={(nodeState?.state || "idle") as any}
      durationMs={nodeState?.durationMs}
      nodeId={id}
    >
      <div className="text-xs text-gray-600">
        <div className="font-medium mb-1">Data</div>
        <div className="bg-gray-50 p-2 rounded max-h-40 overflow-auto nopan nodrag">
          <JsonComposer
            value={data.jsonData ?? {}}
            onChange={(next) => updateNodeData(id, { jsonData: next })}
            ownerNodeId={id}
            onCreateReference={(src, dst) => ensureEdge(src, dst)}
          />
        </div>
        <p className="text-[10px] text-gray-500 mt-1">
          Outputs the entire JSON value; references ($ref) are resolved.
        </p>
      </div>
    </BaseNode>
  )
}

