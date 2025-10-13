import { ComponentConfig } from "@measured/puck"
import { MarkedInput } from "../metadata"

export interface DataDisplayProps {
  nodeId: string
  format: "json" | "pretty"
}

export const DataDisplayComponent: ComponentConfig<DataDisplayProps> = {
  fields: {
    nodeId: {
      type: "text",
      label: "Node ID (from marked inputs)",
    },
    format: {
      type: "radio",
      options: [
        { label: "JSON", value: "json" },
        { label: "Pretty", value: "pretty" },
      ],
    },
  },
  defaultProps: {
    nodeId: "",
    format: "pretty",
  },
  render: ({ nodeId, format, puck }) => {
    if (!puck?.metadata) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            No marked inputs available
          </p>
        </div>
      )
    }

    const markedInputs = (puck.metadata as any).markedInputs as Record<
      string,
      MarkedInput
    >

    if (!nodeId) {
      return (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded">
          <p className="text-sm text-gray-600 mb-2">
            Available marked inputs:
          </p>
          <ul className="text-xs space-y-1">
            {Object.keys(markedInputs).map((id) => (
              <li key={id} className="font-mono">
                {id} - {markedInputs[id].label}
              </li>
            ))}
          </ul>
        </div>
      )
    }

    const node = markedInputs[nodeId]

    if (!node) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">
            Node "{nodeId}" not found in marked inputs
          </p>
        </div>
      )
    }

    if (format === "json") {
      return (
        <pre className="p-4 bg-gray-900 text-green-400 rounded overflow-auto text-xs font-mono">
          {JSON.stringify(node.data, null, 2)}
        </pre>
      )
    }

    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-semibold text-sm mb-2">{node.label}</h4>
        <div className="text-xs space-y-1">
          <p>
            <span className="font-medium">ID:</span> {node.id}
          </p>
          <p>
            <span className="font-medium">Type:</span> {node.type}
          </p>
          <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto">
            {JSON.stringify(node.data, null, 2)}
          </pre>
        </div>
      </div>
    )
  },
}

