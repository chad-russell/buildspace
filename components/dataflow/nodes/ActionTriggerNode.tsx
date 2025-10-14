import React from "react"
import { NodeProps } from "reactflow"
import { BaseNode } from "./BaseNode"
import { Zap } from "lucide-react"
import { useDataFlowStore } from "@/lib/stores/dataflow-store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ActionTriggerNode({ data, selected, id }: NodeProps) {
  const updateNodeData = useDataFlowStore((s) => s.updateNodeData)

  return (
    <BaseNode
      title={data.label || "Action Trigger"}
      selected={selected}
      icon={<Zap className="w-4 h-4" />}
      showTargetHandle={true}
      showSourceHandle={false}
      color="bg-orange-500"
      nodeId={id}
    >
      <div className="space-y-3 text-xs w-64">
        <div>
          <Label className="text-xs text-gray-600">Action Name</Label>
          <Input
            type="text"
            value={data.actionName || ""}
            onChange={(e) => updateNodeData(id, { actionName: e.target.value })}
            className="text-xs mt-1 nodrag nopan font-mono"
            placeholder="createPost"
          />
          <p className="text-[10px] text-gray-500 mt-1">
            Unique identifier for this action
          </p>
        </div>
        <div className="text-[11px] text-gray-500 border-t pt-2">
          Consumes upstream values on trigger; action result prefers the Page's updated state.
        </div>
      </div>
    </BaseNode>
  )
}
