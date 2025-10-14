import React, { useState } from "react"
import { NodeProps } from "reactflow"
import { BaseNode } from "./BaseNode"
import { FileText, ExternalLink } from "lucide-react"
import { useDataFlowStore } from "@/lib/stores/dataflow-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { JsonComposer } from "@/components/json/JsonComposer"

export function PageNode({ data, selected, id }: NodeProps) {
  const updateNodeData = useDataFlowStore((s) => s.updateNodeData)
  const ensureEdge = useDataFlowStore((s) => s.ensureEdge)
  const flowId = useDataFlowStore((s) => s.flowId)
  const router = useRouter()

  // Convert pageState schema to actual state object for JsonComposer
  // If it's an array (schema format), convert to { key: defaultValue } object
  const pageStateObject = React.useMemo(() => {
    const schema = data.pageState || {}
    if (Array.isArray(schema)) {
      const stateObj: Record<string, any> = {}
      schema.forEach((field: any) => {
        if (field.key) {
          stateObj[field.key] = field.defaultValue
        }
      })
      return stateObj
    }
    return schema
  }, [data.pageState])

  const handleOpenEditor = () => {
    if (flowId) {
      router.push(`/build/project/${flowId}/page/${id}`)
    }
  }

  return (
    <BaseNode
      title={data.label || "Page"}
      selected={selected}
      icon={<FileText className="w-4 h-4" />}
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
          <Label className="text-xs text-gray-600 font-semibold mb-1 block">Page State</Label>
          <div className="bg-gray-50 p-2 rounded max-h-40 overflow-auto nopan nodrag">
            <JsonComposer
              value={pageStateObject}
              onChange={(next) => {
                // Convert state object back to schema array format
                if (next && typeof next === 'object' && !Array.isArray(next)) {
                  const schema = Object.entries(next).map(([key, value]) => ({
                    key,
                    defaultValue: value,
                    type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string'
                  }))
                  updateNodeData(id, { pageState: schema })
                } else {
                  updateNodeData(id, { pageState: next })
                }
              }}
              ownerNodeId={id}
              onCreateReference={(src, dst) => ensureEdge(src, dst)}
            />
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

