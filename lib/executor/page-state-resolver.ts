import { DataFlowGraph, DataFlowNode } from "@/lib/types/dataflow"
import { topologicalSort } from "./topological-sort"
import { executeDataNode } from "./nodes/data-executor"
import { executeHttpRequestNode } from "./nodes/http-request-executor"
import { executePageNode } from "./nodes/page-executor"

/**
 * Resolve the initial state for a page node by executing it and its dependencies.
 * 
 * This function finds all upstream dependencies of a page node, executes them in order,
 * and returns the resolved page state with all $ref references resolved to their actual values.
 * 
 * @param graphData - The full dataflow graph
 * @param pageNodeId - The ID of the page node to resolve state for
 * @returns The resolved page state object
 */
export async function resolvePageState(
  graphData: DataFlowGraph,
  pageNodeId: string
): Promise<Record<string, any>> {
  const context = new Map<string, any>()
  
  // Find the page node
  const pageNode = graphData.nodes.find((n) => n.id === pageNodeId)
  if (!pageNode) {
    throw new Error(`Page node ${pageNodeId} not found`)
  }

  // Find all upstream dependencies of the page node
  const dependencies = findUpstreamDependencies(graphData, pageNodeId)
  
  // Sort dependencies in execution order
  const sortedNodes = topologicalSort(
    graphData.nodes.filter((n) => dependencies.has(n.id) || n.id === pageNodeId),
    graphData.edges.filter((e) => 
      (dependencies.has(e.source) || e.source === pageNodeId) &&
      (dependencies.has(e.target) || e.target === pageNodeId)
    )
  )

  // Execute each dependency node
  for (const node of sortedNodes) {
    let output: any
    
    switch (node.type) {
      case "data":
        output = await executeDataNode(node, context)
        break
      case "httpRequest":
        output = await executeHttpRequestNode(node, context)
        break
      case "page":
        // This is the page node itself
        output = await executePageNode(node, context)
        break
      default:
        // Skip unsupported node types (like actionTrigger, setValue, inspect)
        // These don't contribute to initial page state
        continue
    }

    context.set(node.id, output)
  }

  // Return the resolved page state
  const resolvedState = context.get(pageNodeId)
  return resolvedState || {}
}

/**
 * Find all upstream dependencies of a node (nodes that this node depends on).
 * Uses breadth-first search to find all transitive dependencies.
 */
function findUpstreamDependencies(
  graphData: DataFlowGraph,
  nodeId: string
): Set<string> {
  const dependencies = new Set<string>()
  const queue: string[] = [nodeId]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const currentId = queue.shift()!
    if (visited.has(currentId)) continue
    visited.add(currentId)

    // Find all edges that target this node
    const incomingEdges = graphData.edges.filter((e) => e.target === currentId)
    
    for (const edge of incomingEdges) {
      if (!dependencies.has(edge.source) && edge.source !== nodeId) {
        dependencies.add(edge.source)
        queue.push(edge.source)
      }
    }
  }

  return dependencies
}

