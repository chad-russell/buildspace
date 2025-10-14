import { DataFlowNode } from "@/lib/types/dataflow"

/**
 * Execute a Select node.
 * 
 * **Input Consumption**: CONSUMES FIRST INPUT ONLY.
 * 
 * **Behavior**: Projects/renames fields from the input object based on the configured
 * `fields` array and optional `renameMap`. Uses dot notation for nested field access.
 * 
 * **Output**: A new object containing only the selected fields (with optional renames).
 * If no fields are configured, passes through the input unchanged.
 */
export async function executeSelectNode(
  node: DataFlowNode,
  context: Map<string, any>,
  inputs: any[]
): Promise<any> {
  // Get the first input (Select node should have exactly one input)
  const inputData = inputs[0]

  if (!inputData) {
    throw new Error("Select node requires an input")
  }

  const { fields = [], renameMap = {} } = node.data

  if (fields.length === 0) {
    return inputData // If no fields specified, pass through
  }

  const result: any = {}

  for (const field of fields) {
    const value = getNestedValue(inputData, field)
    const outputKey = renameMap[field] || field
    setNestedValue(result, outputKey, value)
  }

  return result
}

// Helper function to get nested value using dot notation
function getNestedValue(obj: any, path: string): any {
  const keys = path.split(".")
  let current = obj

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined
    }
    current = current[key]
  }

  return current
}

// Helper function to set nested value using dot notation
function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split(".")
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== "object") {
      current[key] = {}
    }
    current = current[key]
  }

  current[keys[keys.length - 1]] = value
}

