import * as React from "react"
import type { CustomField } from "@measured/puck"

export type DataPath = string | undefined

// Simple input that accepts drops from JsonComposer
export const DataPathField: CustomField<DataPath> = {
  type: "custom",
  label: "Data Path (e.g., data-0.jsonData.fieldName)",
  render: ({ value, onChange, readOnly }) => {
    const ref = React.useRef<HTMLInputElement>(null)

    const handleDrop: React.DragEventHandler<HTMLInputElement> = (e) => {
      if (readOnly) return
      const raw = e.dataTransfer.getData("application/x-json-path")
      if (!raw) return
      e.preventDefault()
      try {
        const { nodeId, path } = JSON.parse(raw) as {
          nodeId: string
          path: (string | number)[]
        }
        // Infer node type from nodeId prefix (e.g., "data-0" -> "data", "httpRequest-0" -> "httpRequest")
        const nodeType = nodeId.split("-")[0]
        
        // Join numeric segments as plain dotted segments to match resolveDataPath
        const dot = path.map((seg) => `${seg}`).join(".")
        
        // For data nodes, use .jsonData path; for other nodes (like httpRequest), use direct path
        // TODO(chad): why jsonData for data nodes, and not direct path for other nodes? Let's make an effort to simplify this.
        let next: string
        if (nodeType === "data") {
          next = `${nodeId}.jsonData${dot ? "." + dot : ""}`
        } else {
          // For httpRequest and other nodes, the path is direct
          // resolveDataPath will handle looking into previewData for httpRequest nodes
          next = `${nodeId}${dot ? "." + dot : ""}`
        }
        
        onChange(next)
      } catch {}
    }

    const handleDragOver: React.DragEventHandler<HTMLInputElement> = (e) => {
      // Only prevent default if this looks like our JSON path payload
      if (e.dataTransfer.types.includes("application/x-json-path")) {
        e.preventDefault()
      }
    }

    return (
      <input
        ref={ref}
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        placeholder="data-0.jsonData.fieldName"
        readOnly={readOnly}
        className="w-full border rounded px-2 py-1 text-sm"
      />
    )
  },
}

export default DataPathField


