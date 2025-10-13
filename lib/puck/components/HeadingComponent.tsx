import { ComponentConfig } from "@measured/puck"
import { resolveDataPath, MarkedInput } from "../metadata"
import { DataPathField } from "../fields/DataPathField"

export interface HeadingProps {
  text: string
  level: "1" | "2" | "3" | "4" | "5" | "6"
  useDataBinding: boolean
  dataPath?: string
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
    text: "Heading",
    level: "1",
    useDataBinding: false,
    dataPath: "",
  },
  resolveData: async ({ props }) => {
    if ((props as any).dataPath && !(props as any).useDataBinding) {
      return { props: { ...props, useDataBinding: true } as any }
    }
    return { props }
  },
  render: ({ text, level, useDataBinding, dataPath, puck }) => {
    let displayText = text
    let debugInfo = null

    if (useDataBinding && puck?.metadata) {
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
              ✓ Bound to: {dataPath}
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

