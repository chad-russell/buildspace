import React, { useState } from "react"
import { NodeProps } from "reactflow"
import { BaseNode } from "./BaseNode"
import { Zap, Plus, X } from "lucide-react"
import { useDataFlowStore } from "@/lib/stores/dataflow-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface NamedInput {
  key: string
  required: boolean
}

export function ActionTriggerNode({ data, selected, id }: NodeProps) {
  const updateNodeData = useDataFlowStore((s) => s.updateNodeData)
  const [newInputKey, setNewInputKey] = useState("")

  const namedInputs = (data.namedInputs as NamedInput[]) || []

  const handleAddInput = () => {
    if (!newInputKey.trim()) return

    const newInput: NamedInput = {
      key: newInputKey.trim(),
      required: true,
    }

    updateNodeData(id, {
      namedInputs: [...namedInputs, newInput],
    })

    setNewInputKey("")
  }

  const handleRemoveInput = (index: number) => {
    const updated = namedInputs.filter((_, i) => i !== index)
    updateNodeData(id, { namedInputs: updated })
  }

  const handleUpdateInput = (
    index: number,
    updates: Partial<NamedInput>
  ) => {
    const updated = namedInputs.map((input, i) =>
      i === index ? { ...input, ...updates } : input
    )
    updateNodeData(id, { namedInputs: updated })
  }

  return (
    <BaseNode
      title={data.label || "Action Trigger"}
      selected={selected}
      icon={<Zap className="w-4 h-4" />}
      showTargetHandle={true}
      showSourceHandle={true}
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

        <div className="border-t pt-3">
          <Label className="text-xs text-gray-600 font-semibold">
            Named Inputs
          </Label>

          {namedInputs.length > 0 && (
            <div className="mt-2 space-y-2">
              {namedInputs.map((input, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded border"
                >
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={input.key}
                      onChange={(e) =>
                        handleUpdateInput(index, { key: e.target.value })
                      }
                      className="text-xs nodrag nopan font-mono"
                      placeholder="inputKey"
                    />
                  </div>
                  <label className="flex items-center gap-1 text-[10px] text-gray-600 nodrag nopan">
                    <input
                      type="checkbox"
                      checked={input.required}
                      onChange={(e) =>
                        handleUpdateInput(index, { required: e.target.checked })
                      }
                      className="nodrag nopan"
                    />
                    Required
                  </label>
                  <button
                    onClick={() => handleRemoveInput(index)}
                    className="text-red-500 hover:text-red-700 nodrag nopan"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 space-y-2">
            <Input
              type="text"
              value={newInputKey}
              onChange={(e) => setNewInputKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddInput()
                }
              }}
              className="text-xs nodrag nopan font-mono"
              placeholder="New input key"
            />
            <Button
              size="sm"
              onClick={handleAddInput}
              className="w-full nodrag nopan"
              variant="outline"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Input
            </Button>
          </div>
        </div>

        {data.stateMapping && Object.keys(data.stateMapping).length > 0 && (
          <div className="border-t pt-2">
            <Label className="text-xs text-gray-600 font-semibold">
              State Mapping
            </Label>
            <div className="mt-1 text-[10px] text-gray-600 space-y-1">
              {Object.entries(data.stateMapping).map(([input, stateKey]) => (
                <div key={input} className="font-mono">
                  {input} ← {stateKey}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  )
}

