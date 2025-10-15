import { DataFlowNode, DataFlowEdge } from "@/lib/types/dataflow"

export function topologicalSort(
  nodes: DataFlowNode[],
  edges: DataFlowEdge[]
): DataFlowNode[] {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const inDegree = new Map<string, number>()
  const adjacencyList = new Map<string, string[]>()

  // Initialize in-degree and adjacency list
  for (const node of nodes) {
    inDegree.set(node.id, 0)
    adjacencyList.set(node.id, [])
  }

  // Build graph
  for (const edge of edges) {
    adjacencyList.get(edge.source)?.push(edge.target)
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
  }

  // Find all nodes with no incoming edges
  const queue: string[] = []
  for (const [nodeId, degree] of Array.from(inDegree.entries())) {
    if (degree === 0) {
      queue.push(nodeId)
    }
  }

  const sorted: DataFlowNode[] = []

  while (queue.length > 0) {
    const nodeId = queue.shift()!
    const node = nodeMap.get(nodeId)
    if (node) {
      sorted.push(node)
    }

    const neighbors = adjacencyList.get(nodeId) || []
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) || 0) - 1
      inDegree.set(neighbor, newDegree)
      if (newDegree === 0) {
        queue.push(neighbor)
      }
    }
  }

  // Check for cycles
  if (sorted.length !== nodes.length) {
    throw new Error("Cycle detected in graph")
  }

  return sorted
}

