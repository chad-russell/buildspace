import { DataFlowNode } from "@/lib/types/dataflow"
import { isRef, getAtPath } from "@/lib/json/path"
import type { JsonPathRef } from "@/lib/types/dataflow"

/**
 * Execute a Page node.
 * 
 * **Input Consumption**: IGNORES inputs (state schema-driven).
 * 
 * **Behavior**: Returns the resolved page state value. The `node.data.pageState`
 * configuration defines the state schema (array or object format), and any embedded
 * $ref references are resolved against the execution context.
 * 
 * **Output**: The fully resolved page state object.
 * 
 * **Note**: During action flows, this output may be mutated by SetValue nodes
 * and the updated state is returned as the action result.
 */
export async function executePageNode(
  node: DataFlowNode,
  context: Map<string, any>
): Promise<any> {
  // Helper to resolve any expression (literal or reference)
  const resolveExpr = (v: any): any => {
    if (isRef(v)) {
      const ref = v.$ref as JsonPathRef
      const [first, ...rest] = ref
      if (!context.has(first.id)) {
        throw new Error(`Reference source ${first.id} not found in context`)
      }
      const root = context.get(first.id)
      return getAtPath(root, rest as any)
    }
    if (Array.isArray(v)) return v.map((x) => resolveExpr(x))
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const entries = Object.entries(v).map(([k, x]) => [k, resolveExpr(x)])
      return Object.fromEntries(entries)
    }
    return v
  }

  // Page nodes output their resolved page state
  // The pageState in node.data is a schema (array or object), we need to convert it to actual state values
  const pageStateSchema = node.data.pageState ?? {}
  
  // If it's an array (old format with field definitions), convert to state object
  if (Array.isArray(pageStateSchema)) {
    const stateValues: Record<string, any> = {}
    for (const field of pageStateSchema) {
      if (field.key) {
        stateValues[field.key] = resolveExpr(field.defaultValue)
      }
    }
    return stateValues
  }
  
  // Otherwise it's already a state object, just resolve any references
  return resolveExpr(pageStateSchema)
}

