import { DataFlowGraph, FlowExecutionResult, NodeExecutionResult } from "@/lib/types/dataflow"
import { topologicalSort } from "./topological-sort"
import { executeDataNode } from "./nodes/data-executor"
import { executeHttpRequestNode } from "./nodes/http-request-executor"
import { executeSelectNode } from "./nodes/select-executor"
import { executeInspectNode } from "./nodes/inspect-executor"

/**
 * Execute an action flow starting from an action trigger node
 * @param graphData The full dataflow graph
 * @param triggerNodeId The ID of the action trigger node
 * @param actionInputs The mapped inputs from page state
 */
export async function executeActionFlow(
  graphData: DataFlowGraph,
  triggerNodeId: string,
  actionInputs: Record<string, any>
): Promise<FlowExecutionResult> {
  const startTime = Date.now()
  const nodeResults: NodeExecutionResult[] = []
  const context = new Map<string, any>()

  try {
    // Find the trigger node
    const triggerNode = graphData.nodes.find((n) => n.id === triggerNodeId)
    if (!triggerNode) {
      throw new Error(`Trigger node ${triggerNodeId} not found`)
    }

    // Inject the action inputs as the trigger node's output
    context.set(triggerNodeId, actionInputs)
    nodeResults.push({
      nodeId: triggerNodeId,
      output: actionInputs,
      executionTime: 0,
    })

    // Find all nodes downstream from the trigger
    const downstreamNodes = getDownstreamNodes(graphData, triggerNodeId)

    if (downstreamNodes.length === 0) {
      // No downstream nodes, return the action inputs as the final output
      return {
        success: true,
        finalOutput: actionInputs,
        nodeResults,
        totalExecutionTime: Date.now() - startTime,
      }
    }

    // Sort downstream nodes in execution order
    const sortedNodes = topologicalSort(downstreamNodes, graphData.edges)

    // Execute each downstream node
    for (const node of sortedNodes) {
      const nodeStartTime = Date.now()

      try {
        // Get inputs for this node
        const inputs = getNodeInputs(node.id, graphData.edges, context)

        // Execute the node based on its type
        let output: any
        switch (node.type) {
          case "data":
            output = await executeDataNode(node, context)
            break
          case "httpRequest":
            output = await executeHttpRequestNode(node, context)
            break
          case "select":
            output = await executeSelectNode(node, context, inputs)
            break
          case "inspect":
            output = await executeInspectNode(node, context, inputs)
            break
          default:
            throw new Error(`Unknown node type: ${node.type}`)
        }

        // Store the output in context
        context.set(node.id, output)

        // Record execution result
        nodeResults.push({
          nodeId: node.id,
          output,
          executionTime: Date.now() - nodeStartTime,
        })
      } catch (error) {
        // Record error for this node
        nodeResults.push({
          nodeId: node.id,
          output: null,
          error: error instanceof Error ? error.message : "Unknown error",
          executionTime: Date.now() - nodeStartTime,
        })
        throw error
      }
    }

    // Get the final output (output of the last executed node)
    const lastNode = sortedNodes[sortedNodes.length - 1]
    const finalOutput = lastNode ? context.get(lastNode.id) : actionInputs

    return {
      success: true,
      finalOutput,
      nodeResults,
      totalExecutionTime: Date.now() - startTime,
    }
  } catch (error) {
    return {
      success: false,
      finalOutput: null,
      nodeResults,
      totalExecutionTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Get all nodes downstream from a given node
 */
function getDownstreamNodes(
  graphData: DataFlowGraph,
  startNodeId: string
): any[] {
  const visited = new Set<string>()
  const downstream: any[] = []

  function traverse(nodeId: string) {
    if (visited.has(nodeId)) return
    visited.add(nodeId)

    // Find all edges where this node is the source
    const outgoingEdges = graphData.edges.filter((edge) => edge.source === nodeId)

    for (const edge of outgoingEdges) {
      const targetNode = graphData.nodes.find((n) => n.id === edge.target)
      if (targetNode && !downstream.find((n) => n.id === targetNode.id)) {
        downstream.push(targetNode)
        traverse(targetNode.id)
      }
    }
  }

  traverse(startNodeId)
  return downstream
}

/**
 * Helper function to get inputs for a node
 */
function getNodeInputs(
  nodeId: string,
  edges: any[],
  context: Map<string, any>
): any[] {
  const inputs: any[] = []

  // Find all edges that target this node
  const incomingEdges = edges.filter((edge) => edge.target === nodeId)

  // Get the output from each source node
  for (const edge of incomingEdges) {
    const sourceOutput = context.get(edge.source)
    if (sourceOutput !== undefined) {
      inputs.push(sourceOutput)
    }
  }

  return inputs
}

