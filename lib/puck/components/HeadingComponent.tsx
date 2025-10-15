import { ComponentConfig } from "@measured/puck"
import { resolveDataPath, MarkedInput } from "../metadata"
import { DataPathField } from "../fields/DataPathField"
import { StateKeyField } from "../fields/StateKeyField"
import { PropKeyField } from "../fields/PropKeyField"
import { usePageState } from "../context/PageStateContext"

export interface HeadingProps {
  text: string
  level: "1" | "2" | "3" | "4" | "5" | "6"
  bindingType: "none" | "serverData" | "pageState" | "componentProp"
  dataPath?: string
  stateKey?: string
  propKey?: string
}

export const HeadingComponent: ComponentConfig<HeadingProps> = {
  fields: {
    text: {
      type: "text",
    },
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
    bindingType: {
      type: "radio",
      options: [
        { label: "Static Text", value: "none" },
        { label: "Server Data", value: "serverData" },
        { label: "Page State", value: "pageState" },
        { label: "Component Props", value: "componentProp" },
      ],
    },
    dataPath: DataPathField,
    stateKey: StateKeyField,
    propKey: PropKeyField,
  },
  defaultProps: {
    text: "Heading",
    level: "1",
    bindingType: "none",
    dataPath: "",
    stateKey: "",
    propKey: "",
  },
  // resolveData removed - was causing focus loss on input due to prop mutations
  render: ({ text, level, bindingType, dataPath, stateKey, propKey, puck }) => {
    let displayText = text
    let debugInfo = null

    // Try to get page state (will be null in design mode)
    let pageState: any = null
    try {
      const context = usePageState()
      pageState = context.pageState
    } catch {
      // Not in PageStateProvider context (design-time)
    }

    // Server Data Binding
    if (bindingType === "serverData" && puck?.metadata) {
      const markedInputs = (puck.metadata as any).markedInputs as Record<
        string,
        MarkedInput
      >
      
      if (dataPath) {
        const resolvedData = resolveDataPath(markedInputs, dataPath)
        if (resolvedData !== undefined) {
          displayText =
            typeof resolvedData === "string"
              ? resolvedData
              : JSON.stringify(resolvedData)
          
          debugInfo = (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs font-normal">
              ✓ Server data bound to: {dataPath}
            </div>
          )
        } else {
          debugInfo = (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs font-normal">
              ✗ Invalid path: {dataPath}
            </div>
          )
        }
      }
    }

    // Page State Binding
    if (bindingType === "pageState") {
      if (!stateKey) {
        debugInfo = (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs font-normal">
            Page state binding enabled but no key selected
          </div>
        )
      } else if (pageState) {
        // Runtime: display actual state value
        const stateValue = pageState[stateKey]
        displayText =
          stateValue !== undefined
            ? typeof stateValue === "string"
              ? stateValue
              : JSON.stringify(stateValue)
            : `[${stateKey} not found]`
        
        debugInfo = (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs font-normal">
            ✓ Page state bound to: {stateKey}
          </div>
        )
      } else {
        // Design time: show binding info
        debugInfo = (
          <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs font-normal">
            Bound to page state: {stateKey} (preview mode)
          </div>
        )
      }
    }

    // Component Props Binding
    if (bindingType === "componentProp") {
      const componentProps = (puck?.metadata as any)?.componentProps
      
      if (!propKey) {
        debugInfo = (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs font-normal">
            Component props binding enabled but no prop selected
          </div>
        )
      } else if (componentProps) {
        // Get the value from component props
        const propValue = componentProps[propKey]
        
        displayText =
          propValue !== undefined
            ? typeof propValue === "string"
              ? propValue
              : JSON.stringify(propValue)
            : `[${propKey} not found]`
        
        if (propValue !== undefined) {
          debugInfo = (
            <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded text-xs font-normal">
              ✓ Component prop bound to: {propKey}
            </div>
          )
        } else {
          debugInfo = (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs font-normal">
              ✗ Prop "{propKey}" not found
              <div className="mt-1 text-red-700">
                Available props: {Object.keys(componentProps).join(", ") || "(none)"}
              </div>
            </div>
          )
        }
      } else {
        // Design time: show binding info
        debugInfo = (
          <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs font-normal">
            Bound to component prop: {propKey} (will resolve at runtime)
          </div>
        )
      }
    }

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
        <Tag className={sizeClasses[level]}>{displayText}</Tag>
        {debugInfo}
      </div>
    )
  },
}

