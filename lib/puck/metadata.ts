import { Node } from "reactflow"
import { PageStateField } from "@/lib/types/dataflow"

export interface MarkedInput {
  id: string
  type: string
  label: string
  data: any
}

export interface PuckMetadata {
  markedInputs: Record<string, MarkedInput>
  pageStateSchema?: PageStateField[]
  componentProps?: Record<string, any>
}

/**
 * Formats dependency nodes into Puck metadata structure
 * This allows Puck components to access marked input data via puck.metadata
 */
export function createPuckMetadata(
  dependencies: Node[],
  pageStateSchema?: PageStateField[]
): PuckMetadata {
  const markedInputs: Record<string, MarkedInput> = {}

  dependencies.forEach((node) => {
    markedInputs[node.id] = {
      id: node.id,
      type: node.type || "unknown",
      label: node.data.label || node.id,
      data: node.data,
    }
  })

  return { markedInputs, pageStateSchema }
}

/**
 * Helper to resolve $ref references in data
 * $ref format: { "$ref": [{ "id": "nodeId" }, "path", "to", "field"] }
 */
function resolveReference(
  ref: any,
  markedInputs: Record<string, MarkedInput>
): any {
  if (!ref || typeof ref !== "object" || !ref.$ref) return ref
  
  const refArray = ref.$ref
  if (!Array.isArray(refArray) || refArray.length === 0) return ref
  
  // First element is { id: "nodeId" }
  const nodeIdObj = refArray[0]
  if (!nodeIdObj || typeof nodeIdObj !== "object" || !nodeIdObj.id) return ref
  
  const nodeId = nodeIdObj.id
  const node = markedInputs[nodeId]
  if (!node) return ref
  
  // Navigate the path starting from the node's output root
  // For Data nodes, use jsonData so refs resolve against the authored payload
  // For HttpRequest nodes, use previewData for design-time resolution
  let result: any
  if (node.type === "data") {
    result = node.data?.jsonData
  } else if (node.type === "httpRequest") {
    result = node.data?.previewData
  } else {
    result = node.data
  }
  
  for (let i = 1; i < refArray.length; i++) {
    if (result === null || result === undefined) return undefined
    result = result[refArray[i]]
  }
  
  // Recursively resolve in case the result is also a reference
  return resolveReference(result, markedInputs)
}

/**
 * Helper to resolve a data path from marked inputs
 * Example: resolveDataPath(markedInputs, "data-1.jsonData.users")
 * Also resolves $ref references automatically
 * Supports both data nodes (data-1.jsonData.field) and httpRequest nodes (httpRequest-0.field)
 */
export function resolveDataPath(
  markedInputs: Record<string, MarkedInput>,
  path: string
): any {
  if (!path) return undefined

  const parts = path.split(".")
  const nodeId = parts[0]
  const node = markedInputs[nodeId]

  if (!node) return undefined

  // Navigate the rest of the path through the node's data
  // Start from the appropriate root based on node type
  let result = node.data
  
  // For httpRequest nodes, if path goes directly to a field (e.g., httpRequest-0.title),
  // use previewData as the root
  if (node.type === "httpRequest" && parts.length > 1 && parts[1] !== "previewData") {
    result = node.data.previewData
    // Skip the node ID and navigate from previewData
    for (let i = 1; i < parts.length; i++) {
      if (result === null || result === undefined) return undefined
      result = result[parts[i]]
    }
  } else {
    // Standard navigation for data nodes or explicit paths
    for (let i = 1; i < parts.length; i++) {
      if (result === null || result === undefined) return undefined
      result = result[parts[i]]
    }
  }

  // Resolve any $ref references in the result
  return resolveReference(result, markedInputs)
}

/**
 * Creates metadata for component props
 * Converts prop values into a format that child components can access
 */
export function createComponentPropsMetadata(
  props: Record<string, any>
): Record<string, any> {
  return props
}

/**
 * Resolves component props at runtime
 * Handles literal values, page state references, and server data references
 */
export function resolveComponentProps(
  propsConfig: Record<string, any>,
  pageState?: Record<string, any>,
  markedInputs?: Record<string, MarkedInput>
): Record<string, any> {
  const resolved: Record<string, any> = {}

  Object.entries(propsConfig).forEach(([key, value]) => {
    // If value is a reference object, resolve it
    if (value && typeof value === "object" && value.$ref) {
      if (markedInputs) {
        resolved[key] = resolveReference(value, markedInputs)
      } else {
        resolved[key] = undefined
      }
    } else if (
      value &&
      typeof value === "object" &&
      value.type === "pageState" &&
      value.key
    ) {
      // Page state reference
      resolved[key] = pageState?.[value.key]
    } else {
      // Literal value
      resolved[key] = value
    }
  })

  return resolved
}

