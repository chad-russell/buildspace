"use client"

import { FieldLabel } from "@measured/puck"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export interface TextBindingValue {
  bindingType: "none" | "serverData" | "pageState" | "componentProp"
  text?: string
  dataPath?: string
  stateKey?: string
  propKey?: string
}

export interface TextBindingFieldOptions {
  allowServerData?: boolean
  allowPageState?: boolean
  allowComponentProps?: boolean
}

export function createTextBindingField(options: TextBindingFieldOptions = {
  allowServerData: true,
  allowPageState: true,
  allowComponentProps: false,
}) {
  return {
    type: "custom" as const,
    render: ({ name, onChange, value }: { 
      name: string
      onChange: (val: TextBindingValue) => void
      value: TextBindingValue 
    }) => {
      const currentValue: TextBindingValue = value || {
        bindingType: "none",
        text: "",
        dataPath: "",
        stateKey: "",
        propKey: "",
      }

      const handleBindingTypeChange = (newType: TextBindingValue["bindingType"]) => {
        onChange({
          ...currentValue,
          bindingType: newType,
        })
      }

    const handleTextChange = (newText: string) => {
      onChange({
        ...currentValue,
        text: newText,
      })
    }

    const handleDataPathChange = (newPath: string) => {
      onChange({
        ...currentValue,
        dataPath: newPath,
      })
    }

    const handleStateKeyChange = (newKey: string) => {
      onChange({
        ...currentValue,
        stateKey: newKey,
      })
    }

    const handlePropKeyChange = (newKey: string) => {
      onChange({
        ...currentValue,
        propKey: newKey,
      })
    }

    return (
      <div className="space-y-4">
        <div>
          <FieldLabel label="Binding Type" />
          <div className="flex gap-2 mt-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleBindingTypeChange("none")}
              className={`flex-1 px-3 py-2 text-sm rounded border transition-colors ${
                currentValue.bindingType === "none"
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Static Text
            </button>
            
            {options.allowServerData && (
              <button
                type="button"
                onClick={() => handleBindingTypeChange("serverData")}
                className={`flex-1 px-3 py-2 text-sm rounded border transition-colors ${
                  currentValue.bindingType === "serverData"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Server Data
              </button>
            )}
            
            {options.allowPageState && (
              <button
                type="button"
                onClick={() => handleBindingTypeChange("pageState")}
                className={`flex-1 px-3 py-2 text-sm rounded border transition-colors ${
                  currentValue.bindingType === "pageState"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Page State
              </button>
            )}
            
            {options.allowComponentProps && (
              <button
                type="button"
                onClick={() => handleBindingTypeChange("componentProp")}
                className={`flex-1 px-3 py-2 text-sm rounded border transition-colors ${
                  currentValue.bindingType === "componentProp"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Component Props
              </button>
            )}
          </div>
        </div>

        {currentValue.bindingType === "none" && (
          <div>
            <Label htmlFor={`${name}-text`}>Text</Label>
            <Textarea
              id={`${name}-text`}
              value={currentValue.text || ""}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter your text here..."
              className="mt-1"
              rows={4}
            />
          </div>
        )}

        {currentValue.bindingType === "serverData" && (
          <div>
            <Label htmlFor={`${name}-dataPath`}>Data Path</Label>
            <Input
              id={`${name}-dataPath`}
              value={currentValue.dataPath || ""}
              onChange={(e) => handleDataPathChange(e.target.value)}
              onDragOver={(e) => {
                if (e.dataTransfer.types.includes("application/x-json-path")) {
                  e.preventDefault()
                }
              }}
              onDrop={(e) => {
                const raw = e.dataTransfer.getData("application/x-json-path")
                if (!raw) return
                e.preventDefault()
                try {
                  const { nodeId, path } = JSON.parse(raw) as {
                    nodeId: string
                    path: (string | number)[]
                  }
                  // Infer node type from nodeId prefix
                  const nodeType = nodeId.split("-")[0]
                  
                  // Join numeric segments as plain dotted segments
                  const dot = path.map((seg) => `${seg}`).join(".")
                  
                  // For data nodes, use .jsonData path; for other nodes, use direct path
                  let dataPath: string
                  if (nodeType === "data") {
                    dataPath = `${nodeId}.jsonData${dot ? "." + dot : ""}`
                  } else {
                    dataPath = `${nodeId}${dot ? "." + dot : ""}`
                  }
                  
                  handleDataPathChange(dataPath)
                } catch (err) {
                  console.error("Failed to parse drop data:", err)
                }
              }}
              placeholder="httpRequest-0.title"
              className="mt-1 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Drag a field from Marked Inputs or type manually (e.g., httpRequest-0.title)
            </p>
          </div>
        )}

        {currentValue.bindingType === "pageState" && (
          <div>
            <Label htmlFor={`${name}-stateKey`}>State Key</Label>
            <Input
              id={`${name}-stateKey`}
              value={currentValue.stateKey || ""}
              onChange={(e) => handleStateKeyChange(e.target.value)}
              placeholder="username"
              className="mt-1 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              The key in the page state object to bind to
            </p>
          </div>
        )}

        {currentValue.bindingType === "componentProp" && (
          <div>
            <Label htmlFor={`${name}-propKey`}>Component Prop</Label>
            <Input
              id={`${name}-propKey`}
              value={currentValue.propKey || ""}
              onChange={(e) => handlePropKeyChange(e.target.value)}
              placeholder="title"
              className="mt-1 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              The component prop to bind to (defined in props schema)
            </p>
          </div>
        )}
      </div>
    )
  },
  }
}

// Export default for page-level components (backward compatibility)
export const TextBindingField = createTextBindingField({
  allowServerData: true,
  allowPageState: true,
  allowComponentProps: false,
})

// Export variant for component editor
export const ComponentTextBindingField = createTextBindingField({
  allowServerData: false,
  allowPageState: false,
  allowComponentProps: true,
})

