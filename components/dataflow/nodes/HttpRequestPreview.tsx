import React, { useState } from "react"
import { useDataFlowStore } from "@/lib/stores/dataflow-store"
import { JsonComposer } from "@/components/json/JsonComposer"
import { Button } from "@/components/ui/button"

interface HttpRequestPreviewProps {
  nodeId: string
  nodeData: {
    url?: string
    method?: string
    headers?: Record<string, string>
    queryParams?: Record<string, string>
    previewData?: any
  }
}

/**
 * Shared HTTP request preview component with fetch functionality
 * Used in both HttpRequestNode (main canvas) and MarkedInputNode (page editor sidebar)
 */
export function HttpRequestPreview({ nodeId, nodeData }: HttpRequestPreviewProps) {
  const { updateNodeData, flowId } = useDataFlowStore()
  const ensureEdge = useDataFlowStore((s) => s.ensureEdge)
  const [isFetchingPreview, setIsFetchingPreview] = useState(false)
  const [previewError, setPreviewError] = useState("")
  const hasPreview = Boolean(nodeData.previewData)

  const handleFetchPreview = async () => {
    if (!nodeData.url) {
      setPreviewError("URL is required")
      return
    }

    setIsFetchingPreview(true)
    setPreviewError("")

    try {
      const response = await fetch(
        `/api/dataflows/${flowId}/nodes/${nodeId}/preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nodeData: {
              url: nodeData.url,
              method: nodeData.method || "GET",
              headers: nodeData.headers || {},
              queryParams: nodeData.queryParams || {},
            },
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to fetch preview")
      }

      const result = await response.json()
      updateNodeData(nodeId, { previewData: result.data })
    } catch (error) {
      console.error("Error fetching preview:", error)
      setPreviewError(
        error instanceof Error ? error.message : "Failed to fetch preview"
      )
    } finally {
      setIsFetchingPreview(false)
    }
  }

  const handleClearPreview = () => {
    updateNodeData(nodeId, { previewData: undefined })
    setPreviewError("")
  }

  return (
    <div className="text-xs text-gray-600 nopan nodrag">
      {nodeData.url ? (
        <>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              {nodeData.method || "GET"}
            </span>
          </div>
          <div className="text-[10px] break-all mb-2">{nodeData.url}</div>

          <div className="flex gap-1 mb-2">
            <Button
              onClick={handleFetchPreview}
              disabled={isFetchingPreview}
              size="sm"
              variant="outline"
              className="text-[10px] h-6 px-2 flex-1"
            >
              {isFetchingPreview ? "Fetching..." : hasPreview ? "Refresh" : "Fetch Preview"}
            </Button>
            {hasPreview && (
              <Button
                onClick={handleClearPreview}
                size="sm"
                variant="ghost"
                className="text-[10px] h-6 px-2"
              >
                Clear
              </Button>
            )}
          </div>

          {previewError && (
            <div className="text-[10px] text-red-500 mb-2">{previewError}</div>
          )}

          {hasPreview && (
            <div className="mt-2 border-t pt-2">
              <div className="text-[10px] font-medium text-gray-700 mb-1">
                Response (drag to bind):
              </div>
              <div className="max-h-64 overflow-auto bg-gray-50 rounded p-2 border">
                <JsonComposer
                  value={nodeData.previewData}
                  readOnly={true}
                  ownerNodeId={nodeId}
                  onCreateReference={(src, dst) => ensureEdge(src, dst)}
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-gray-400 italic">No URL configured</div>
      )}
    </div>
  )
}

