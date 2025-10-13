"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MarkedInputNode } from "./MarkedInputNode"
import { useDataFlowStore } from "@/lib/stores/dataflow-store"
import { usePageState } from "@/lib/puck/context/PageStateContext"

interface DependenciesSidebarProps {
  pageNodeId: string
}

export function DependenciesSidebar({ pageNodeId }: DependenciesSidebarProps) {
  // Get live dependencies from the store
  const dependencies = useDataFlowStore((state) =>
    state.getPageDependencies(pageNodeId)
  )
  const allNodes = useDataFlowStore((s) => s.nodes)
  const currentPageNode = allNodes.find((n) => n.id === pageNodeId)
  const pageStateSchema: Array<{ key: string; defaultValue: any }> =
    (currentPageNode?.data?.pageState as any[]) || []

  // Live page state values via context
  let pageState: Record<string, any> = {}
  try {
    pageState = usePageState().pageState
  } catch {
    pageState = {}
  }

  return (
    <Card className="w-80 h-full border-r rounded-none overflow-auto">
      <CardHeader className="sticky top-0 bg-white z-10 border-b">
        <CardTitle className="text-lg">Marked Inputs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {dependencies.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-8">
            No dependencies yet.
            <div className="text-xs mt-2">
              Connect nodes to the page node to mark them as inputs.
            </div>
          </div>
        ) : (
          dependencies.map((node) => (
            <MarkedInputNode key={node.id} node={node} />
          ))
        )}
      </CardContent>

      {/* Page State Section */}
      <CardHeader className="sticky top-0 bg-white z-10 border-y">
        <CardTitle className="text-lg">Page State</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {pageStateSchema.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-8">
            No state fields yet.
            <div className="text-xs mt-2">Add fields in the Page node on the main canvas.</div>
          </div>
        ) : (
          pageStateSchema.map((field) => (
            <div
              key={field.key}
              className="flex items-center justify-between border rounded px-2 py-1 bg-gray-50 cursor-grab"
              draggable
              onDragStart={(e) => {
                const payload = { stateKey: field.key }
                e.dataTransfer.setData(
                  "application/x-state-key",
                  JSON.stringify(payload)
                )
                e.dataTransfer.setData("text/plain", field.key)
              }}
            >
              <div className="text-xs">
                <div className="font-mono font-medium">{field.key}</div>
                <div className="text-gray-600">
                  {String(
                    pageState[field.key] !== undefined
                      ? pageState[field.key]
                      : field.defaultValue
                  )}
                </div>
              </div>
              <div className="text-[10px] text-gray-500">drag</div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

