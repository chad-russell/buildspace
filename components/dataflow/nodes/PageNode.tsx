import React, { useState, useMemo } from "react"
import { NodeProps } from "reactflow"
import { BaseNode } from "./BaseNode"
import { FileText, ExternalLink } from "lucide-react"
import { useDataFlowStore } from "@/lib/stores/dataflow-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { JsonComposer } from "@/components/json/JsonComposer"

export function PageNode({ data, selected, id }: NodeProps) {
  const updateNodeData = useDataFlowStore((s) => s.updateNodeData)
  const ensureEdge = useDataFlowStore((s) => s.ensureEdge)
  const flowId = useDataFlowStore((s) => s.flowId)
  const nodes = useDataFlowStore((s) => s.nodes)
  const router = useRouter()

  // Get all ActionTrigger nodes for the page load trigger selector
  const actionTriggers = useMemo(() => {
    return nodes.filter(node => node.type === 'actionTrigger')
  }, [nodes])

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
      showSourceHandle={false}
      showTargetHandle={false}
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

        <div>
          <Label className="text-xs text-gray-600">Page Load Trigger</Label>
          <Select
            value={data.onLoadTriggerId || "__none__"}
            onValueChange={(value) => updateNodeData(id, { onLoadTriggerId: value === "__none__" ? undefined : value })}
          >
            <SelectTrigger className="text-xs mt-1 nodrag nopan">
              <SelectValue placeholder="Select trigger..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {actionTriggers.map((trigger) => (
                <SelectItem key={trigger.id} value={trigger.id}>
                  {trigger.data.actionName || trigger.data.label || trigger.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-gray-500 mt-1">
            Which ActionTrigger to execute when this page loads
          </p>
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

