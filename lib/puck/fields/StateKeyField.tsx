import * as React from "react"
import type { CustomField } from "@measured/puck"
import { FieldLabel } from "@measured/puck"

export type StateKey = string | undefined

/**
 * Custom field for selecting a page state key from available state fields
 */
export const StateKeyField: CustomField<StateKey> = {
  type: "custom",
  render: ({ value, onChange, readOnly }) => {
    const handleDrop: React.DragEventHandler<HTMLInputElement> = (e) => {
      if (readOnly) return
      const raw = e.dataTransfer.getData("application/x-state-key")
      if (!raw) return
      e.preventDefault()
      try {
        const { stateKey } = JSON.parse(raw) as { stateKey: string }
        onChange(stateKey)
      } catch {}
    }

    const handleDragOver: React.DragEventHandler<HTMLInputElement> = (e) => {
      if (e.dataTransfer.types.includes("application/x-state-key")) {
        e.preventDefault()
      }
    }

    return (
      <div className="space-y-1">
        <FieldLabel label="Page State Binding" />
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          readOnly={readOnly}
          placeholder="e.g., username, email, password"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    )
  },
}

export default StateKeyField

