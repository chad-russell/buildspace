import { ComponentConfig } from "@measured/puck"
import { UnifiedBindingField } from "../fields/UnifiedBindingField"
import { resolveBinding, parseBindingType } from "../utils/binding-resolver"
import { usePageState } from "../context/PageStateContext"
import { useCollectionItemProps } from "../context/CollectionItemContext"

export interface HeadingProps {
  value: string
  level: "1" | "2" | "3" | "4" | "5" | "6"
}

export const HeadingComponent: ComponentConfig<HeadingProps> = {
  fields: {
    value: UnifiedBindingField,
    level: {
      type: "select",
      options: [
        { label: "H1", value: "1" },
        { label: "H2", value: "2" },
        { label: "H3", value: "3" },
        { label: "H4", value: "4" },
        { label: "H5", value: "5" },
        { label: "H6", value: "6" },
      ],
    },
  },
  defaultProps: {
    value: "Heading",
    level: "1",
  },
  render: (props) => {
    const { level, puck } = props
    let { value } = props
    
    // Backwards compatibility: migrate old format to new @ syntax
    const oldFormatProps = props as any
    if (!value && oldFormatProps.bindingType === "componentProp" && oldFormatProps.propKey) {
      value = `@props.${oldFormatProps.propKey}`
    } else if (!value && oldFormatProps.text) {
      value = oldFormatProps.text
    }
    // Get page state (null if not in PageStateProvider)
    let pageState: any = null
    try {
      const context = usePageState()
      pageState = context.pageState
    } catch {
      // Not in PageStateProvider context
    }

    // @TODO(chad): should we even be checking both here? Maybe we should *only* check metadata?
    // Get component props - check metadata first (for custom components), then Collection context
    let componentProps: any = undefined
    
    // First check if we have componentProps in metadata (custom components pass resolved props here)
    componentProps = (puck?.metadata as any)?.componentProps
    
    // If not, try Collection context (for built-in components used directly in Collections)
    if (!componentProps) {
      try {
        const collectionProps = useCollectionItemProps()
        if (collectionProps) componentProps = collectionProps
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
        debugInfo = (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs font-normal text-red-800">
            ✗ Could not resolve: {value}
          </div>
        )
      }
    }

    const finalText = typeof displayText === "string" 
      ? displayText 
      : displayText !== undefined 
      ? JSON.stringify(displayText) 
      : ""

    const Tag = `h${level}` as keyof JSX.IntrinsicElements
    const sizeClasses = {
      "1": "text-4xl font-bold",
      "2": "text-3xl font-bold",
      "3": "text-2xl font-semibold",
      "4": "text-xl font-semibold",
      "5": "text-lg font-medium",
      "6": "text-base font-medium",
    }

    return (
      <div>
        <Tag className={sizeClasses[level]}>{finalText}</Tag>
        {debugInfo}
      </div>
    )
  },
}
