import { DataFlowNode } from "@/lib/types/dataflow"
import { isRef, getAtPath, setAtPath } from "@/lib/json/path"
import type { JsonPathRef } from "@/lib/types/dataflow"

export async function executeSetValueNode(
  node: DataFlowNode,
  context: Map<string, any>
): Promise<any> {
  const { target, value } = node.data

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

  // Validate target is a reference
  if (!target || !isRef(target)) {
    throw new Error("SetValue node requires a valid target reference")
  }

  const targetRef = target.$ref as JsonPathRef
  const [targetNodeRef, ...targetPath] = targetRef

  if (!targetNodeRef || !targetNodeRef.id) {
    throw new Error("Invalid target reference: missing node ID")
  }

  const targetNodeId = targetNodeRef.id

  // Validate that the path is not empty (must point to a specific path within the node)
  if (targetPath.length === 0) {
    throw new Error("Target reference must point to a specific path within the node, not the entire node")
  }

  // Get current state of the target node
  if (!context.has(targetNodeId)) {
    throw new Error(`Target node ${targetNodeId} not found in context`)
  }

  const currentState = context.get(targetNodeId)

  // Resolve the value to set
  const resolvedValue = resolveExpr(value)

  // Create updated state
  const updatedState = setAtPath(currentState, targetPath as any, resolvedValue)

  // Mutate the context by updating the target node's entry
  context.set(targetNodeId, updatedState)

  // Return the value that was set
  return resolvedValue
}

