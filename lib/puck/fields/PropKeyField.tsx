import * as React from "react"
import type { CustomField } from "@measured/puck"
import { FieldLabel } from "@measured/puck"

export type PropKey = string | undefined

/**
 * Custom field for selecting a component prop key
 */
export const PropKeyField: CustomField<PropKey> = {
  type: "custom",
  render: ({ value, onChange, readOnly }) => {
    return (
      <div className="space-y-1">
        <FieldLabel label="Component Prop Binding" />
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder="e.g., title, description, count"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500">
          The component prop to bind to (defined in props schema)
        </p>
      </div>
    )
  },
}

export default PropKeyField

