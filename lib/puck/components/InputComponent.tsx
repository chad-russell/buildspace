import { ComponentConfig } from "@measured/puck"
import { UnifiedBindingField } from "../fields/UnifiedBindingField"
import { usePageState } from "../context/PageStateContext"
import { parseBindingType } from "../utils/binding-resolver"

export interface InputProps {
  label: string
  placeholder: string
  stateKey: string
  type: "text" | "email" | "password" | "number"
}

export const InputComponent: ComponentConfig<InputProps> = {
  fields: {
    label: {
      type: "text",
      label: "Label",
    },
    placeholder: {
      type: "text",
      label: "Placeholder",
    },
    stateKey: UnifiedBindingField,
    type: {
      type: "radio",
      options: [
        { label: "Text", value: "text" },
        { label: "Email", value: "email" },
        { label: "Password", value: "password" },
        { label: "Number", value: "number" },
      ],
    },
  },
  defaultProps: {
    label: "Input Label",
    placeholder: "Enter value...",
    stateKey: "@pageState.username",
    type: "text",
  },
  render: ({ label, placeholder, stateKey, type }) => {
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

    // Extract the actual key from @pageState.key syntax
    const bindingInfo = parseBindingType(stateKey)
    const actualKey = bindingInfo.type === "pageState" ? bindingInfo.key : stateKey

    const value = (actualKey && pageState?.[actualKey]) ?? ""
    const isEditable = !!updateState

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (updateState && actualKey) {
        let newValue: any = e.target.value
        if (type === "number") {
          newValue = parseFloat(newValue) || 0
        }
        updateState({ [actualKey]: newValue })
      }
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={!isEditable}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {!isEditable && (
          <p className="text-xs text-gray-500 mt-1">
            {stateKey
              ? `Bound to: ${stateKey} (preview mode)`
              : "No state key selected"}
          </p>
        )}
      </div>
    )
  },
}
