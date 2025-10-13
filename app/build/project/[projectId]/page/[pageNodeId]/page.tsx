"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { PageEditor } from "@/components/dataflow/PageEditor"
import { useDataFlowStore } from "@/lib/stores/dataflow-store"
import { Node } from "reactflow"

export default function PageEditorPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const pageNodeId = params.pageNodeId as string

  const { setFlowId, setNodes, setEdges } = useDataFlowStore()
  const [pageNode, setPageNode] = useState<Node | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPageData = async () => {
      try {
        // Load the project/dataflow graph data
        console.log("Loading page data for project:", projectId, "page:", pageNodeId)
        const response = await fetch(`/api/dataflows/${projectId}`)
        if (response.ok) {
          const flow = await response.json()
          console.log("Flow loaded:", flow)
          const graphData = flow.graphData

          // Initialize the store with the flow data
          setFlowId(projectId)
          setNodes(graphData.nodes || [])
          setEdges(graphData.edges || [])

          // Find the specific page node
          const page = graphData.nodes.find((n: Node) => n.id === pageNodeId)
          console.log("Found page node:", page)
          console.log("Page node puckData:", page?.data?.puckData)
          setPageNode(page || null)
        }
      } catch (error) {
        console.error("Error loading page data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (projectId && pageNodeId) {
      loadPageData()
    }
  }, [projectId, pageNodeId, setFlowId, setNodes, setEdges])

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!pageNode) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-gray-500">Page node not found</div>
      </div>
    )
  }

  return (
    <PageEditor
      projectId={projectId}
      pageNodeId={pageNodeId}
      pageNode={pageNode}
    />
  )
}

