import { ComponentConfig } from "@measured/puck"
import { resolveDataPath, MarkedInput } from "../metadata"
import { DataPathField } from "../fields/DataPathField"

export interface TextProps {
  text: string
  useDataBinding: boolean
  dataPath?: string
}

export const TextComponent: ComponentConfig<TextProps> = {
  fields: {
    text: {
      type: "textarea",
    },
    useDataBinding: {
      type: "radio",
      options: [
        { label: "Static Text", value: false },
        { label: "Bind to Data", value: true },
      ],
    },
    dataPath: DataPathField,
  },
  defaultProps: {
    text: "Enter your text here...",
    useDataBinding: false,
    dataPath: "",
  },
  // resolveData removed - was causing focus loss on input due to prop mutations
  render: ({ text, useDataBinding, dataPath, puck }) => {
    let displayText = text
    let debugInfo = null

    if (useDataBinding && puck?.metadata) {
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
              Data binding enabled but no path set
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
                ✓ Data bound to: {dataPath}
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

    return (
      <div>
        <p className="text-base">{displayText}</p>
        {debugInfo}
      </div>
    )
  },
}

