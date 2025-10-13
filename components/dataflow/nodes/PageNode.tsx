import React, { useState } from "react"
import { NodeProps, Position } from "reactflow"
import { BaseNode, NodeHandle } from "./BaseNode"
import { FileText, ExternalLink, Plus, X } from "lucide-react"
import { useDataFlowStore } from "@/lib/stores/dataflow-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { PageStateField } from "@/lib/types/dataflow"

export function PageNode({ data, selected, id }: NodeProps) {
  const updateNodeData = useDataFlowStore((s) => s.updateNodeData)
  const flowId = useDataFlowStore((s) => s.flowId)
  const router = useRouter()
  const [newFieldKey, setNewFieldKey] = useState("")
  const [newFieldDefaultValue, setNewFieldDefaultValue] = useState("")

  const pageState = (data.pageState as PageStateField[]) || []

  const handleOpenEditor = () => {
    if (flowId) {
      router.push(`/build/project/${flowId}/page/${id}`)
    }
  }

  const handleAddStateField = () => {
    if (!newFieldKey.trim()) return
    
    const newField: PageStateField = {
      key: newFieldKey.trim(),
      defaultValue: newFieldDefaultValue || "",
      type: "string",
    }
    
    updateNodeData(id, {
      pageState: [...pageState, newField],
    })
    
    setNewFieldKey("")
    setNewFieldDefaultValue("")
  }

  const handleRemoveStateField = (index: number) => {
    const updated = pageState.filter((_, i) => i !== index)
    updateNodeData(id, { pageState: updated })
  }

  const handleUpdateStateField = (index: number, updates: Partial<PageStateField>) => {
    const updated = pageState.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    )
    updateNodeData(id, { pageState: updated })
  }

  // Define handles: target on left (50%), data output on right (33%), state output on right (67%)
  const handles: NodeHandle[] = [
    {
      type: "target",
      id: "target",
      position: Position.Left,
      className: "w-3 h-3 !bg-gray-400",
      style: { top: "50%" },
    },
    {
      type: "source",
      id: "data",
      position: Position.Right,
      label: "Data",
      className: "w-3 h-3 !bg-blue-500",
      style: { top: "33%" },
    },
    {
      type: "source",
      id: "state",
      position: Position.Right,
      label: "State",
      className: "w-3 h-3 !bg-green-500",
      style: { top: "67%" },
    },
  ]

  return (
    <BaseNode
      title={data.label || "Page"}
      selected={selected}
      icon={<FileText className="w-4 h-4" />}
      handles={handles}
      color="bg-purple-500"
      nodeId={id}
    >
      <div className="space-y-3 text-xs w-64">
        <div>
          <Label className="text-xs text-gray-600">Page Name</Label>
          <Input
            type="text"
            value={data.label || ""}
            onChange={(e) => updateNodeData(id, { label: e.target.value })}
            className="text-xs mt-1 nodrag nopan"
            placeholder="My Page"
          />
        </div>
        
        <div>
          <Label className="text-xs text-gray-600">URL Slug</Label>
          <Input
            type="text"
            value={data.slug || ""}
            onChange={(e) => updateNodeData(id, { slug: e.target.value })}
            className="text-xs mt-1 nodrag nopan"
            placeholder="my-page"
          />
        </div>

        <div className="border-t pt-3">
          <Label className="text-xs text-gray-600 font-semibold">Page State</Label>
          
          {pageState.length > 0 && (
            <div className="mt-2 space-y-2">
              {pageState.map((field, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 bg-gray-50 rounded border"
                >
                  <div className="flex-1 space-y-1">
                    <Input
                      type="text"
                      value={field.key}
                      onChange={(e) =>
                        handleUpdateStateField(index, { key: e.target.value })
                      }
                      className="text-xs nodrag nopan font-mono"
                      placeholder="fieldKey"
                    />
                    <Input
                      type="text"
                      value={field.defaultValue}
                      onChange={(e) =>
                        handleUpdateStateField(index, {
                          defaultValue: e.target.value,
                        })
                      }
                      className="text-xs nodrag nopan"
                      placeholder="default value"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveStateField(index)}
                    className="text-red-500 hover:text-red-700 nodrag nopan mt-1"
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
              value={newFieldKey}
              onChange={(e) => setNewFieldKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddStateField()
                }
              }}
              className="text-xs nodrag nopan font-mono"
              placeholder="New field key"
            />
            <Input
              type="text"
              value={newFieldDefaultValue}
              onChange={(e) => setNewFieldDefaultValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddStateField()
                }
              }}
              className="text-xs nodrag nopan"
              placeholder="Default value"
            />
            <Button
              size="sm"
              onClick={handleAddStateField}
              className="w-full nodrag nopan"
              variant="outline"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add State Field
            </Button>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleOpenEditor}
          className="w-full nodrag nopan"
          variant="default"
        >
          <ExternalLink className="w-3 h-3 mr-2" />
          Open Editor
        </Button>
      </div>
    </BaseNode>
  )
}

