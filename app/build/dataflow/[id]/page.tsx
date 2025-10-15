"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { FlowEditor } from "@/components/dataflow/FlowEditor"
import { useDataFlowStore } from "@/lib/stores/dataflow-store"
import { Button } from "@/components/ui/button"
import { Save, Play } from "lucide-react"
import { useRunStore } from "@/lib/stores/run-store"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function DataFlowEditorPage() {
  const router = useRouter()
  const params = useParams()
  const flowId = params.id as string
  const {
    setFlowId,
    setNodes,
    setEdges,
    nodes,
    edges,
    flowName,
    setFlowName,
    isSaving,
    setIsSaving,
  } = useDataFlowStore()
  const runStore = useRunStore()

  // Load flow data from API
  useEffect(() => {
    if (flowId && flowId !== "new") {
      setFlowId(flowId)
      fetchFlow(flowId)
    } else {
      setFlowId(null)
      setNodes([])
      setEdges([])
    }
  }, [flowId])

  const fetchFlow = async (id: string) => {
    try {
      const response = await fetch(`/api/dataflows/${id}`)
      if (response.ok) {
        const flow = await response.json()
        setFlowName(flow.name)
        if (flow.graphData) {
          setNodes(flow.graphData.nodes || [])
          // sanitize any legacy edges that might contain string "null"/"undefined" handle ids
          const sanitizedEdges = (flow.graphData.edges || []).map((e: any) => ({
            ...e,
            sourceHandle: e.sourceHandle ?? undefined,
            targetHandle: e.targetHandle ?? undefined,
          }))
          setEdges(sanitizedEdges)
        }
      }
    } catch (error) {
      console.error("Error loading flow:", error)
    }
  }

  // // Auto-save functionality
  // useEffect(() => {
  //   const saveTimer = setTimeout(() => {
  //     if (flowId && flowId !== "new" && nodes.length > 0) {
  //       saveFlow()
  //     }
  //   }, 2000) // Auto-save after 2 seconds of inactivity

  //   return () => clearTimeout(saveTimer)
  // }, [nodes, edges, flowName, flowId])

  const saveFlow = async () => {
    if (!flowId || flowId === "new") return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/dataflows/${flowId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: flowName,
          graphData: { nodes, edges },
        }),
      })

      if (!response.ok) {
        console.error("Failed to save flow")
      }
    } catch (error) {
      console.error("Error saving flow:", error)
    } finally {
      setTimeout(() => setIsSaving(false), 500)
    }
  }

  const handleManualSave = async () => {
    await saveFlow()
  }

  const handleTestRun = async () => {
    if (!flowId || flowId === "new") {
      alert("Please save the flow before testing")
      return
    }
    // Start SSE streaming execution; console drawer will open in editor
    ;(window as any).startRunStream?.(flowId)
  }

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="h-14 border-b flex items-center justify-between px-4 bg-white">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/build")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-semibold">BuildSpace</h1>
          <input
            type="text"
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            className="text-sm border-none focus:outline-none focus:ring-0 font-medium"
          />
        </div>
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-xs text-gray-500">Saving...</span>
          )}
          {runStore.status === "running" && (
            <span className="text-xs text-green-600">Running…</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSave}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            size="sm"
            onClick={handleTestRun}
          >
            <Play className="w-4 h-4 mr-2" />
            Test Run
          </Button>
        </div>
      </div>
      
      <div className="flex-1">
        <FlowEditor />
      </div>
    </div>
  )
}

