import { ComponentConfig } from "@measured/puck"
import { UnifiedBindingField } from "../fields/UnifiedBindingField"
import { usePageState } from "../context/PageStateContext"
import { resolveBinding, parseBindingType } from "../utils/binding-resolver"

export interface CheckboxProps {
  label: string
  checked: string // Will be either "true"/"false" or "@pageState.key" or "@inputs.path"
}

export const CheckboxComponent: ComponentConfig<CheckboxProps> = {
  fields: {
    label: {
      type: "text",
      label: "Label",
    },
    checked: UnifiedBindingField,
  },
  defaultProps: {
    label: "Checkbox Label",
    checked: "@pageState.isChecked",
  },
  render: ({ checked, label, puck }) => {
    // Check if we're in a context with page state (runtime)
    let pageState: any = null
    let updateState: any = null

    try {
      const context = usePageState()
      pageState = context.pageState
      updateState = context.updateState
    } catch {
      // Not in PageStateProvider context (design-time)
    }

    // Resolve the binding to get the actual value
    const resolvedValue = resolveBinding(checked, {
      markedInputs: (puck?.metadata as any)?.markedInputs,
      pageState,
      componentProps: (puck?.metadata as any)?.componentProps,
    })

    // Parse binding type to understand what we're dealing with
    const bindingInfo = parseBindingType(checked)

    // Determine the actual checked state
    // Convert string to boolean with flexible matching
    const toBool = (val: any): boolean => {
      if (typeof val === "boolean") return val
      if (typeof val === "number") return val !== 0
      if (typeof val === "string") {
        const lower = val.toLowerCase().trim()
        return lower === "true" || lower === "yes"
      }
      return false
    }

    let isChecked: boolean
    if (bindingInfo.type === "static") {
      // Handle literal string values (case-insensitive: true/yes = true, false/no = false, anything else = false)
      isChecked = toBool(checked)
    } else {
      // Handle resolved bindings
      isChecked = toBool(resolvedValue)
    }

    // Only editable if we have updateState and it's a pageState binding
    const isEditable = !!updateState && bindingInfo.type === "pageState"
    const actualKey = bindingInfo.type === "pageState" ? bindingInfo.key : null

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (updateState && actualKey) {
        updateState({ [actualKey]: e.target.checked })
      }
    }

    // Show debug info for dynamic bindings in design mode
    let debugInfo = null
    if (!updateState && bindingInfo.type !== "static") {
      const isResolved = resolvedValue !== undefined && resolvedValue !== checked
      
      if (!isResolved) {
        if (bindingInfo.type === "pageState") {
          debugInfo = (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
              🔗 Bound to page state: {bindingInfo.key} (preview mode)
            </div>
          )
        } else if (bindingInfo.type === "inputs") {
          debugInfo = (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
              🔗 Bound to server data: {bindingInfo.path} (preview mode)
            </div>
          )
        } else if (bindingInfo.type === "props") {
          const propDescription = bindingInfo.key 
            ? `prop: ${bindingInfo.key}` 
            : "entire item"
          debugInfo = (
            <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded text-xs text-purple-800">
              📦 Bound to component {propDescription} (preview to see values)
            </div>
          )
        }
      }
    }

    return (
      <div className="w-full">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            disabled={!isEditable}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
          />
          {label && (
            <span className="text-sm font-medium text-gray-700">
              {label}
            </span>
          )}
        </label>
        {debugInfo}
      </div>
    )
  },
}

