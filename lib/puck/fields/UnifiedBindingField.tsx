"use client"

import * as React from "react"
import type { CustomField } from "@measured/puck"
import { FieldLabel } from "@measured/puck"
import { Textarea } from "@/components/ui/textarea"
import { parseBindingType } from "../utils/binding-resolver"

/**
 * Unified binding field that supports:
 * - Static text (no @ prefix)
 * - @inputs.path.to.data (server/marked inputs)
 * - @pageState.keyName (page state)
 * - @props.keyName (component props)
 */
export const UnifiedBindingField: CustomField<string> = {
  type: "custom",
  render: ({ value, onChange, readOnly }) => {
    const bindingType = parseBindingType(value)
    const isDynamic = bindingType !== "static"

    const getTypeLabel = () => {
      switch (bindingType) {
        case "inputs":
          return "Server Data"
        case "pageState":
          return "Page State"
        case "props":
          return "Component Props"
        case "unknown":
          return "Unknown @ syntax"
        default:
          return "Static Text"
      }
    }

    const getTypeColor = () => {
      switch (bindingType) {
        case "inputs":
          return "text-green-700 bg-green-50 border-green-200"
        case "pageState":
          return "text-blue-700 bg-blue-50 border-blue-200"
        case "props":
          return "text-purple-700 bg-purple-50 border-purple-200"
        case "unknown":
          return "text-red-700 bg-red-50 border-red-200"
        default:
          return "text-gray-700 bg-gray-50 border-gray-200"
      }
    }

    return (
      <div className="space-y-2">
        <FieldLabel label="Value" />
        <Textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder="Static text or @inputs.path, @pageState.key, @props, @props.key"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
          rows={3}
        />
        {isDynamic && (
          <div
            className={`text-xs px-2 py-1 rounded border inline-block ${getTypeColor()}`}
          >
            <span className="font-medium">{getTypeLabel()}</span>
          </div>
        )}
        <div className="text-xs text-gray-500 space-y-1">
          <div>
            <strong>Examples:</strong>
          </div>
          <div className="font-mono">
            • Static text
            <br />
            • @pageState.username
            <br />
            • @props (entire item)
            <br />
            • @props.title
          </div>
        </div>
      </div>
    )
  },
}

export default UnifiedBindingField
