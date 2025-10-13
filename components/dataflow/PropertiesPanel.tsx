"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDataFlowStore } from "@/lib/stores/dataflow-store"
import { Textarea } from "@/components/ui/textarea"
import { JsonComposer } from "@/components/json/JsonComposer"
import { X } from "lucide-react"

export function PropertiesPanel() {
  const { selectedNode, updateNodeData, deleteNode } = useDataFlowStore()

  if (!selectedNode) {
    return (
      <Card className="w-80 h-full border-l">
        <CardHeader>
          <CardTitle className="text-lg">Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Select a node to edit its properties</p>
        </CardContent>
      </Card>
    )
  }

  const handleDelete = () => {
    deleteNode(selectedNode.id)
  }

  return (
    <Card className="w-80 h-full border-l overflow-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Properties</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {selectedNode.type === "data" && <DataNodeProperties node={selectedNode} />}
        {selectedNode.type === "httpRequest" && (
          <HttpRequestNodeProperties node={selectedNode} />
        )}
        {selectedNode.type === "select" && <SelectNodeProperties node={selectedNode} />}
        {selectedNode.type === "inspect" && <InspectNodeProperties node={selectedNode} />}
      </CardContent>
    </Card>
  )
}

function DataNodeProperties({ node }: { node: any }) {
  const { updateNodeData } = useDataFlowStore()
  const [label, setLabel] = useState(node.data.label || "Data")
  const [jsonData, setJsonData] = useState(
    JSON.stringify(node.data.jsonData || {}, null, 2)
  )
  const [error, setError] = useState("")

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonData)
      updateNodeData(node.id, { label, jsonData: parsed })
      setError("")
    } catch (e) {
      setError("Invalid JSON")
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleSave}
        />
      </div>
      <div>
        <Label>JSON Data</Label>
        <div className="mt-2">
          <JsonComposer
            value={(() => {
              try {
                return JSON.parse(jsonData)
              } catch {
                return {}
              }
            })()}
            onChange={(next) => {
              setJsonData(JSON.stringify(next, null, 2))
              try {
                const parsed = typeof next === 'string' ? JSON.parse(next) : next
                updateNodeData(node.id, { label, jsonData: parsed })
                setError("")
              } catch {
                setError("Invalid JSON")
              }
            }}
            ownerNodeId={node.id}
            onCreateReference={(src, dst) => {
              const { ensureEdge } = useDataFlowStore.getState()
              ensureEdge(src, dst)
            }}
          />
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    </div>
  )
}

function HttpRequestNodeProperties({ node }: { node: any }) {
  const { updateNodeData, flowId } = useDataFlowStore()
  const [label, setLabel] = useState(node.data.label || "HTTP Request")
  const [url, setUrl] = useState(node.data.url || "")
  const [method, setMethod] = useState(node.data.method || "GET")
  const [isFetchingPreview, setIsFetchingPreview] = useState(false)
  const [previewError, setPreviewError] = useState("")

  const handleSave = () => {
    updateNodeData(node.id, { label, url, method })
  }

  const handleFetchPreview = async () => {
    if (!url) {
      setPreviewError("URL is required")
      return
    }

    setIsFetchingPreview(true)
    setPreviewError("")

    try {
      const response = await fetch(
        `/api/dataflows/${flowId}/nodes/${node.id}/preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nodeData: {
              url,
              method,
              headers: {},
              queryParams: {},
            },
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to fetch preview")
      }

      const result = await response.json()
      updateNodeData(node.id, { previewData: result.data })
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
    updateNodeData(node.id, { previewData: undefined })
    setPreviewError("")
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleSave}
        />
      </div>
      <div>
        <Label htmlFor="method">Method</Label>
        <Select
          value={method}
          onValueChange={(val) => {
            setMethod(val)
            updateNodeData(node.id, { method: val })
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleSave}
          placeholder="https://api.example.com/data"
        />
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            onClick={handleFetchPreview}
            disabled={isFetchingPreview || !url}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            {isFetchingPreview ? "Fetching..." : "Fetch Preview"}
          </Button>
          {node.data.previewData && (
            <Button
              onClick={handleClearPreview}
              size="sm"
              variant="ghost"
            >
              Clear
            </Button>
          )}
        </div>
        {previewError && (
          <p className="text-xs text-red-500">{previewError}</p>
        )}
      </div>

      {node.data.previewData && (
        <div>
          <Label>Response Preview (drag fields to bind)</Label>
          <div className="mt-2 max-h-96 overflow-auto border rounded p-2 bg-gray-50">
            <JsonComposer
              value={node.data.previewData}
              readOnly={true}
              ownerNodeId={node.id}
              onCreateReference={(src, dst) => {
                const { ensureEdge } = useDataFlowStore.getState()
                ensureEdge(src, dst)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function SelectNodeProperties({ node }: { node: any }) {
  const { updateNodeData } = useDataFlowStore()
  const [label, setLabel] = useState(node.data.label || "Select")
  const [fieldsText, setFieldsText] = useState(
    (node.data.fields || []).join("\n")
  )

  const handleSave = () => {
    const fields = fieldsText
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0)
    updateNodeData(node.id, { label, fields })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleSave}
        />
      </div>
      <div>
        <Label htmlFor="fields">Field Paths (one per line)</Label>
        <Textarea
          id="fields"
          value={fieldsText}
          onChange={(e) => setFieldsText(e.target.value)}
          onBlur={handleSave}
          rows={8}
          placeholder="user.name&#10;user.email&#10;data.items"
          className="font-mono text-xs"
        />
        <p className="text-xs text-gray-500 mt-1">
          Use dot notation for nested fields
        </p>
      </div>
    </div>
  )
}

function InspectNodeProperties({ node }: { node: any }) {
  const { updateNodeData } = useDataFlowStore()
  const [label, setLabel] = useState(node.data.label || "Inspect")

  const handleSave = () => {
    updateNodeData(node.id, { label })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleSave}
        />
      </div>
      <div className="text-sm text-gray-500">
        This node visualizes incoming data. Connect it to another node to inspect its output.
      </div>
    </div>
  )
}

