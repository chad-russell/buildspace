import { ComponentConfig } from "@measured/puck"
import { UnifiedBindingField } from "../fields/UnifiedBindingField"
import { resolveBinding, parseBindingType } from "../utils/binding-resolver"
import { usePageState } from "../context/PageStateContext"
import { useCollectionItemProps } from "../context/CollectionItemContext"

export interface TextProps {
  value: string
}

export const TextComponent: ComponentConfig<TextProps> = {
  fields: {
    value: UnifiedBindingField,
  },
  defaultProps: {
    value: "Enter your text here...",
  },
  render: (props) => {
    const { puck } = props
    let { value } = props
    
    // Backwards compatibility: migrate old format to new @ syntax
    const oldFormatProps = props as any
    if (!value && oldFormatProps.binding) {
      const binding = oldFormatProps.binding
      if (binding.bindingType === "componentProp" && binding.propKey) {
        value = `@props.${binding.propKey}`
      } else if (binding.bindingType === "pageState" && binding.stateKey) {
        value = `@pageState.${binding.stateKey}`
      } else if (binding.bindingType === "serverData" && binding.dataPath) {
        value = `@inputs.${binding.dataPath}`
      } else if (binding.text) {
        value = binding.text
      }
    }
    // Get page state (null if not in PageStateProvider)
    let pageState: any = null
    try {
      const context = usePageState()
      pageState = context.pageState
    } catch {
      // Not in PageStateProvider context (design-time without state)
    }

    // Get component props - check metadata first (for custom components), then Collection context
    let componentProps: any = undefined
    
    // First check if we have componentProps in metadata (custom components pass resolved props here)
    componentProps = (puck?.metadata as any)?.componentProps
    
    // If not, try Collection context (for built-in components used directly in Collections)
    if (!componentProps) {
      try {
        const collectionProps = useCollectionItemProps()
        if (collectionProps) {
          componentProps = collectionProps
        }
      } catch {
        // Not in Collection context
      }
    }

    // Resolve the binding
    const displayText = resolveBinding(value, {
      markedInputs: (puck?.metadata as any)?.markedInputs,
      pageState,
      componentProps,
    })

    // Parse binding type for debug info
    const bindingInfo = parseBindingType(value)
    
    // Show debug info for dynamic bindings (only in edit mode when not resolved)
    let debugInfo = null
    if (bindingInfo.type !== "static") {
      const isResolved = displayText !== undefined && displayText !== value
      
      if (!isResolved) {
        // Check if it's a @props binding that couldn't resolve (expected in edit mode)
        if (bindingInfo.type === "props") {
          const propDescription = bindingInfo.key 
            ? `prop: ${bindingInfo.key}` 
            : "entire item"
          debugInfo = (
            <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded text-xs text-purple-800">
              📦 Will display collection item {propDescription} (preview to see values)
            </div>
          )
        } else {
          debugInfo = (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
              ✗ Could not resolve: {value}
            </div>
          )
        }
      }
    }

    const finalText = typeof displayText === "string" 
      ? displayText 
      : displayText !== undefined 
      ? JSON.stringify(displayText, null, 2) 
      : ""

    return (
      <div>
        <p className="text-base whitespace-pre-wrap">{finalText}</p>
        {debugInfo}
      </div>
    )
  },
}
