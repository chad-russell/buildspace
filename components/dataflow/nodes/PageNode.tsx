import React from "react"
import { NodeProps } from "reactflow"
import { BaseNode } from "./BaseNode"
import { FileText, ExternalLink } from "lucide-react"
import { useDataFlowStore } from "@/lib/stores/dataflow-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export function PageNode({ data, selected, id }: NodeProps) {
  const updateNodeData = useDataFlowStore((s) => s.updateNodeData)
  const flowId = useDataFlowStore((s) => s.flowId)
  const router = useRouter()

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
      showTargetHandle={true}
      showSourceHandle={true}
      color="bg-purple-500"
      nodeId={id}
    >
      <div className="space-y-3 text-xs">
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

        <Button
          size="sm"
          onClick={handleOpenEditor}
          className="w-full nodrag nopan"
          variant="outline"
        >
          <ExternalLink className="w-3 h-3 mr-2" />
          Open Editor
        </Button>
      </div>
    </BaseNode>
  )
}

