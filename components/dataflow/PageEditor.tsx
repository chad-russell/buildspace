"use client"

import React, { useState, useEffect, useRef } from "react"
import { Node } from "reactflow"
import { Data } from "@measured/puck"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { DependenciesSidebar } from "./DependenciesSidebar"
import { PageDesignCanvas } from "./PageDesignCanvas"
import { createPuckMetadata } from "@/lib/puck/metadata"
import { useDataFlowStore } from "@/lib/stores/dataflow-store"

interface PageEditorProps {
  projectId: string
  pageNodeId: string
  pageNode: Node | null
}

const defaultPuckData: Data = {
  content: [],
  root: { props: {} },
}

export function PageEditor({
  projectId,
  pageNodeId,
  pageNode,
}: PageEditorProps) {
  const router = useRouter()
  const [puckData, setPuckData] = useState<Data>(defaultPuckData)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSavingDataflow, setIsSavingDataflow] = useState(false)
  const isInitialMount = useRef(true)

  // Get live dependencies and ALL nodes from the store
  const dependencies = useDataFlowStore((state) =>
    state.getPageDependencies(pageNodeId)
  )
  const allNodes = useDataFlowStore((state) => state.nodes)
  const edges = useDataFlowStore((state) => state.edges)
  const updateNodeData = useDataFlowStore((state) => state.updateNodeData)

  // Initialize Puck data from page node
  useEffect(() => {
    if (pageNode?.data?.puckData) {
      setPuckData(pageNode.data.puckData)
    }
  }, [pageNode])

  // Cleanup: Don't reset store on unmount as it would clear the main canvas state
  // The main canvas will reload its own data when navigating back

  // Auto-save dataflow when nodes/edges change (for marked input edits)
  // Use JSON.stringify to detect actual content changes, not just reference changes
  const nodesJson = JSON.stringify(allNodes)
  const edgesJson = JSON.stringify(edges)
  
  useEffect(() => {
    // Skip the first render to avoid saving on initial load
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const saveDataflow = async () => {
      if (!projectId || projectId === "new") return
      if (allNodes.length === 0) return

      setIsSavingDataflow(true)
      try {
        await fetch(`/api/dataflows/${projectId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            graphData: { nodes: allNodes, edges },
          }),
        })
      } catch (error) {
        console.error("Error auto-saving dataflow:", error)
      } finally {
        setIsSavingDataflow(false)
      }
    }

    // Debounce the save by 1 second
    const timer = setTimeout(saveDataflow, 1000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesJson, edgesJson, projectId])

  // Create metadata from ALL nodes (not just dependencies)
  // This allows resolving references to nodes that aren't direct dependencies
  const metadata = createPuckMetadata(allNodes)

  const handleBack = () => {
    if (hasChanges) {
      const confirm = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      )
      if (!confirm) return
    }
    router.push(`/build/dataflow/${projectId}`)
  }

  const handlePuckChange = (newData: Data) => {
    setPuckData(newData)
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(
        `/api/dataflows/${projectId}/pages/${pageNodeId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ puckData }),
        }
      )

      if (response.ok) {
        setHasChanges(false)
        // Keep the in-memory store in sync so subsequent graph saves don't wipe puckData
        updateNodeData(pageNodeId, { puckData })
        console.log("Updated node data in store with puckData")
        // Could show a success toast here
      } else {
        console.error("Failed to save page design")
        alert("Failed to save page design")
      }
    } catch (error) {
      console.error("Error saving page design:", error)
      alert("Error saving page design")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="h-14 border-b flex items-center justify-between px-4 bg-white">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-lg font-semibold">
            {pageNode?.data?.label || "Page Editor"}
          </h1>
          {pageNode?.data?.slug && (
            <span className="text-sm text-gray-500">/{pageNode.data.slug}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isSavingDataflow && (
            <span className="text-xs text-gray-400">Saving dataflow...</span>
          )}
          {hasChanges && (
            <span className="text-xs text-orange-600">Unsaved page design</span>
          )}
          {isSaving && (
            <span className="text-xs text-gray-500">Saving page...</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Page Design
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <DependenciesSidebar pageNodeId={pageNodeId} />
        <div className="flex-1">
          <PageDesignCanvas
            data={puckData}
            metadata={metadata}
            onChange={handlePuckChange}
          />
        </div>
      </div>
    </div>
  )
}

