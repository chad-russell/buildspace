"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Render, Data } from "@measured/puck"
import "@measured/puck/puck.css"
import { puckConfig } from "@/lib/puck/config"
import { PageStateProvider } from "@/lib/puck/context/PageStateContext"
import { createPuckMetadata } from "@/lib/puck/metadata"
import { resolvePageState } from "@/lib/executor/page-state-resolver"

export default function PublishedPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const slug = params.slug as string

  const [pageData, setPageData] = useState<Data | null>(null)
  const [resolvedState, setResolvedState] = useState<Record<string, any>>({})
  const [metadata, setMetadata] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPageData = async () => {
      try {
        // Load the project/dataflow graph data
        const response = await fetch(`/api/dataflows/${projectId}`)
        if (!response.ok) {
          throw new Error("Failed to load project")
        }

        const flow = await response.json()
        const graphData = flow.graphData

        // Find the page node by slug
        const pageNode = graphData.nodes.find(
          (n: any) => n.type === "page" && n.data.slug === slug
        )

        if (!pageNode) {
          throw new Error(`Page with slug "${slug}" not found`)
        }

        // Extract puckData
        const puckData = pageNode.data.puckData || { content: [], root: {} }
        const pageStateSchema = pageNode.data.pageState || []

        // Resolve the page state by executing dependencies
        const initialState = await resolvePageState(graphData, pageNode.id)

        // Create metadata from all nodes
        const puckMetadata = createPuckMetadata(graphData.nodes, pageStateSchema)

        setPageData(puckData)
        setResolvedState(initialState)
        setMetadata(puckMetadata)
      } catch (err) {
        console.error("Error loading page data:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    if (projectId && slug) {
      loadPageData()
    }
  }, [projectId, slug])

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (error || !pageData) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-red-500">{error || "Page not found"}</div>
      </div>
    )
  }

  return (
    <PageStateProvider initialState={resolvedState} projectId={projectId}>
      <div className="w-full min-h-screen">
        <Render config={puckConfig} data={pageData} />
      </div>
    </PageStateProvider>
  )
}

