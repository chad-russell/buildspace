"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MarkedInputNode } from "./MarkedInputNode"
import { useDataFlowStore } from "@/lib/stores/dataflow-store"

interface DependenciesSidebarProps {
  pageNodeId: string
}

export function DependenciesSidebar({ pageNodeId }: DependenciesSidebarProps) {
  // Get live dependencies from the store
  const dependencies = useDataFlowStore((state) =>
    state.getPageDependencies(pageNodeId)
  )

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
    </Card>
  )
}

