import * as React from "react"
import type { CustomField } from "@measured/puck"

export type StateKey = string | undefined

/**
 * Custom field for selecting a page state key from available state fields
 */
export const StateKeyField: CustomField<StateKey> = {
  type: "custom",
  label: "State Key",
  render: ({ value, onChange, readOnly, puck }) => {
    // Get state schema from metadata
    const stateSchema = (puck?.metadata as any)?.pageStateSchema || []

    const handleDrop: React.DragEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
      if (readOnly) return
      const raw = e.dataTransfer.getData("application/x-state-key")
      if (!raw) return
      e.preventDefault()
      try {
        const { stateKey } = JSON.parse(raw) as { stateKey: string }
        onChange(stateKey)
      } catch {}
    }

    const handleDragOver: React.DragEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
      if (e.dataTransfer.types.includes("application/x-state-key")) {
        e.preventDefault()
      }
    }

    // If we have a schema, render a select. Otherwise render a free text input.
    if (stateSchema.length > 0) {
      return (
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          disabled={readOnly}
          className="w-full border rounded px-2 py-1 text-sm"
        >
          <option value="">Select state key</option>
          {stateSchema.map((field: any) => (
            <option key={field.key} value={field.key}>
              {field.key}
            </option>
          ))}
        </select>
      )
    }

    return (
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        readOnly={readOnly}
        placeholder="username"
        className="w-full border rounded px-2 py-1 text-sm"
      />
    )
  },
}

export default StateKeyField

