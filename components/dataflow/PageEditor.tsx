"use client"

import React, { useState, useEffect, useRef } from "react"
import { Node } from "reactflow"
import { Data, Render } from "@measured/puck"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { DependenciesSidebar } from "./DependenciesSidebar"
import { PageDesignCanvas } from "./PageDesignCanvas"
import { createPuckMetadata } from "@/lib/puck/metadata"
import { useDataFlowStore } from "@/lib/stores/dataflow-store"
import { PageStateProvider } from "@/lib/puck/context/PageStateContext"
import { puckConfig } from "@/lib/puck/config"
import "@measured/puck/puck.css"

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
  // Keep a stable key that only changes when we load new puckData from the page node
  const [resetKey, setResetKey] = useState(0)
  // Preview mode state
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [savedPuckData, setSavedPuckData] = useState<Data>(defaultPuckData)

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
      setSavedPuckData(pageNode.data.puckData)
      // Bump reset key so Puck remounts only when external data is swapped in
      setResetKey((k) => k + 1)
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
  // Also pass the page's state schema
  // IMPORTANT: Get the current page node from the store, not the prop, so we get live updates
  const currentPageNode = allNodes.find((n) => n.id === pageNodeId)
  const pageStateSchema = currentPageNode?.data?.pageState || []
  console.log('PageEditor - currentPageNode from store:', currentPageNode)
  console.log('PageEditor - pageStateSchema:', pageStateSchema)
  const metadata = createPuckMetadata(allNodes, pageStateSchema)
  console.log('PageEditor - metadata:', metadata)

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
        setSavedPuckData(puckData)
        // Keep the in-memory store in sync so subsequent graph saves don't wipe puckData
        updateNodeData(pageNodeId, { puckData })
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

  const handleTogglePreview = () => {
    if (!isPreviewMode) {
      // Entering preview mode - use the saved data from the current page node in store
      const currentPageNode = allNodes.find((n) => n.id === pageNodeId)
      if (currentPageNode?.data?.puckData) {
        setSavedPuckData(currentPageNode.data.puckData)
      }
    }
    setIsPreviewMode(!isPreviewMode)
  }

  // Check if page has been saved at least once
  const hasSavedData = pageNode?.data?.puckData && 
    (pageNode.data.puckData.content.length > 0 || 
     Object.keys(pageNode.data.puckData.root.props || {}).length > 0)

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
            {currentPageNode?.data?.label || pageNode?.data?.label || "Page Editor"}
          </h1>
          {(currentPageNode?.data?.slug || pageNode?.data?.slug) && (
            <span className="text-sm text-gray-500">
              /{currentPageNode?.data?.slug || pageNode?.data?.slug}
            </span>
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
            disabled={!hasChanges || isSaving || isPreviewMode}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Page Design
          </Button>
          <Button
            variant={isPreviewMode ? "default" : "outline"}
            size="sm"
            onClick={handleTogglePreview}
            disabled={!hasSavedData}
          >
            {isPreviewMode ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Exit Preview
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {isPreviewMode ? (
          /* Preview mode - full-screen interactive preview */
          <PageStateProvider stateSchema={pageStateSchema} projectId={projectId}>
            <div className="w-full h-full overflow-auto bg-white">
              <Render config={puckConfig} data={savedPuckData} metadata={metadata} />
            </div>
          </PageStateProvider>
        ) : (
          /* Edit mode - Puck editor with sidebar */
          <PageStateProvider stateSchema={pageStateSchema} projectId={projectId}>
            <DependenciesSidebar pageNodeId={pageNodeId} />
            <div className="flex-1">
              <PageDesignCanvas
                data={puckData}
                metadata={metadata}
                onChange={handlePuckChange}
                projectId={projectId}
                resetKey={resetKey}
              />
            </div>
          </PageStateProvider>
        )}
      </div>
    </div>
  )
}

