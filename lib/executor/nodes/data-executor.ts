import { DataFlowNode } from "@/lib/types/dataflow"
import { isObjectLike, getAtPath } from "@/lib/json/path"
import type { JsonPathRef } from "@/lib/types/dataflow"
import { isRef } from "@/lib/json/path"

export async function executeDataNode(
  node: DataFlowNode,
  context: Map<string, any>
): Promise<any> {
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
    if (isObjectLike(v)) {
      const entries = Object.entries(v).map(([k, x]) => [k, resolveExpr(x)])
      return Object.fromEntries(entries)
    }
    return v
  }

  return resolveExpr(node.data.jsonData ?? {})
}

