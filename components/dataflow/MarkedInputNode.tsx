"use client"

import React from "react"
import { Node } from "reactflow"
import { Database, Globe, Filter, Eye } from "lucide-react"
import { BaseNode } from "./nodes/BaseNode"
import { JsonComposer } from "@/components/json/JsonComposer"
import { useDataFlowStore } from "@/lib/stores/dataflow-store"
import { HttpRequestPreview } from "./nodes/HttpRequestPreview"

interface MarkedInputNodeProps {
  node: Node
}

/**
 * Renders an editable node for the marked inputs sidebar
 * Reuses BaseNode for visual consistency without React Flow context
 */
export function MarkedInputNode({ node }: MarkedInputNodeProps) {
  const updateNodeData = useDataFlowStore((s) => s.updateNodeData)
  const ensureEdge = useDataFlowStore((s) => s.ensureEdge)

  const renderNodeContent = () => {
    switch (node.type) {
      case "data":
        return (
          <BaseNode
            title={node.data.label || "Data"}
            icon={<Database className="w-4 h-4" />}
            color="bg-green-500"
            showTargetHandle={false}
            showSourceHandle={false}
            nodeId={node.id}
          >
            <div className="text-xs text-gray-600">
              <div className="font-medium mb-1">Data</div>
              <div className="bg-gray-50 p-2 rounded max-h-40 overflow-auto nopan nodrag">
                <JsonComposer
                  value={node.data.jsonData ?? {}}
                  onChange={(next) => updateNodeData(node.id, { jsonData: next })}
                  ownerNodeId={node.id}
                  onCreateReference={(src, dst) => ensureEdge(src, dst)}
                />
              </div>
            </div>
          </BaseNode>
        )

      case "httpRequest":
        return <HttpRequestMarkedNode node={node} />

      case "select":
        return (
          <BaseNode
            title={node.data.label || "Select"}
            icon={<Filter className="w-4 h-4" />}
            color="bg-purple-500"
            showTargetHandle={false}
            showSourceHandle={false}
            nodeId={node.id}
          >
            <div className="text-xs text-gray-600">
              <div className="font-medium mb-1">Selected Fields</div>
              {node.data.fields && node.data.fields.length > 0 ? (
                <ul className="space-y-1">
                  {node.data.fields.map((field: string, idx: number) => (
                    <li key={idx} className="font-mono text-xs">
                      {field}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-400">No fields selected</div>
              )}
            </div>
          </BaseNode>
        )

      case "inspect":
        return (
          <BaseNode
            title={node.data.label || "Inspect"}
            icon={<Eye className="w-4 h-4" />}
            color="bg-orange-500"
            showTargetHandle={false}
            showSourceHandle={false}
            nodeId={node.id}
          >
            <div className="text-xs text-gray-600">
              <div className="font-medium">Data Inspector</div>
              <div className="text-gray-400 mt-1">Visualizes input data</div>
            </div>
          </BaseNode>
        )

      default:
        return (
          <div className="p-3 border rounded-lg bg-gray-50">
            <div className="text-sm text-gray-500">
              Unknown node type: {node.type}
            </div>
          </div>
        )
    }
  }

  return <div>{renderNodeContent()}</div>
}

/**
 * HTTP Request node with preview functionality for marked inputs sidebar
 */
function HttpRequestMarkedNode({ node }: { node: Node }) {
  return (
    <BaseNode
      title={node.data.label || "HTTP Request"}
      icon={<Globe className="w-4 h-4" />}
      color="bg-blue-500"
      showTargetHandle={false}
      showSourceHandle={false}
      nodeId={node.id}
    >
      <HttpRequestPreview nodeId={node.id} nodeData={node.data} />
    </BaseNode>
  )
}

