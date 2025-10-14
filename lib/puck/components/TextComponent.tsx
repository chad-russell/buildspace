import { ComponentConfig } from "@measured/puck"
import { resolveDataPath, MarkedInput } from "../metadata"
import { TextBindingField, TextBindingValue } from "../fields/TextBindingField"
import { usePageState } from "../context/PageStateContext"

export interface TextProps {
  binding: TextBindingValue
}

export const TextComponent: ComponentConfig<TextProps> = {
  fields: {
    binding: TextBindingField,
  },
  defaultProps: {
    binding: {
      bindingType: "none",
      text: "Enter your text here...",
      dataPath: "",
      stateKey: "",
    },
  },
  // resolveData removed - was causing focus loss on input due to prop mutations
  render: ({ binding, puck }) => {
    const { bindingType, text, dataPath, stateKey } = binding || {
      bindingType: "none",
      text: "",
      dataPath: "",
      stateKey: "",
    }

    let displayText = text || ""
    let debugInfo = null

    // Try to get page state (will be null in design mode)
    let pageState: any = null
    try {
      const context = usePageState()
      pageState = context.pageState
    } catch (error) {
      // Not in PageStateProvider context (design-time)
    }

    // Server Data Binding
    if (bindingType === "serverData" && puck?.metadata) {
      const markedInputs = (puck.metadata as any).markedInputs as Record<
        string,
        MarkedInput
      >
      
      if (!dataPath) {
        // Show available paths when no path is set
        const availableNodes = Object.keys(markedInputs).map((id) => {
          const node = markedInputs[id]
          return `${id} (${node.label})`
        })
        debugInfo = (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <div className="font-medium text-yellow-800">
              Server data binding enabled but no path set
            </div>
            <div className="mt-1 text-yellow-700">
              Available nodes: {availableNodes.join(", ")}
            </div>
            <div className="mt-1 text-yellow-600 font-mono">
              Example: {Object.keys(markedInputs)[0]}.jsonData.renamed
            </div>
          </div>
        )
      } else {
        const resolvedData = resolveDataPath(markedInputs, dataPath)
        
        if (resolvedData !== undefined) {
          // Successfully resolved data
          displayText =
            typeof resolvedData === "string"
              ? resolvedData
              : JSON.stringify(resolvedData, null, 2)
          
          debugInfo = (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
              <div className="font-medium text-green-800">
                ✓ Server data bound to: {dataPath}
              </div>
            </div>
          )
        } else {
          // Failed to resolve - show error with hints
          const availableNodes = Object.entries(markedInputs).map(([id, node]) => {
            const fields = Object.keys(node.data.jsonData || {})
            return `${id}: ${fields.join(", ")}`
          })
          
          debugInfo = (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
              <div className="font-medium text-red-800">
                ✗ Could not resolve path: {dataPath}
              </div>
              <div className="mt-2 text-red-700">
                <div className="font-medium">Available paths:</div>
                {availableNodes.map((nodeInfo, idx) => (
                  <div key={idx} className="font-mono mt-1">{nodeInfo}</div>
                ))}
              </div>
            </div>
          )
        }
      }
    }

    // Page State Binding
    if (bindingType === "pageState") {
      if (!stateKey) {
        debugInfo = (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <div className="font-medium text-yellow-800">
              Page state binding enabled but no key selected
            </div>
          </div>
        )
      } else if (pageState) {
        // Runtime: display actual state value
        const stateValue = pageState[stateKey]
        
        displayText =
          stateValue !== undefined
            ? typeof stateValue === "string"
              ? stateValue
              : JSON.stringify(stateValue, null, 2)
            : `[${stateKey} not found]`
        
        if (stateValue !== undefined) {
          debugInfo = (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
              <div className="font-medium text-blue-800">
                ✓ Page state bound to: {stateKey}
              </div>
            </div>
          )
        } else {
          debugInfo = (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
              <div className="font-medium text-red-800">
                ✗ Key "{stateKey}" not found in page state
              </div>
              <div className="mt-1 text-red-700 text-xs">
                Available keys: {Object.keys(pageState).join(", ") || "(none)"}
              </div>
            </div>
          )
        }
      } else {
        // Design time: show binding info
        debugInfo = (
          <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
            <div className="font-medium text-gray-800">
              Bound to page state: {stateKey} (preview mode)
            </div>
          </div>
        )
      }
    }

    return (
      <div>
        <p className="text-base">{displayText}</p>
        {debugInfo}
      </div>
    )
  },
}

