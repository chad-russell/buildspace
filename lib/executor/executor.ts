import { DataFlowGraph, NodeExecutionResult, FlowExecutionResult } from "@/lib/types/dataflow"
import { topologicalSort } from "./topological-sort"
import { executeDataNode } from "./nodes/data-executor"
import { executeHttpRequestNode } from "./nodes/http-request-executor"
import { executeInspectNode } from "./nodes/inspect-executor"
import { executeSetValueNode } from "./nodes/set-value-executor"
import { executePageNode } from "./nodes/page-executor"
import { executeActionTriggerNode } from "./nodes/action-trigger-executor"
import { Reporter, buildPreview } from "./events"

export async function executeDataFlow(
  graphData: DataFlowGraph,
  options?: { reporter?: Reporter; signal?: AbortSignal }
): Promise<FlowExecutionResult> {
  const startTime = Date.now()
  const nodeResults: NodeExecutionResult[] = []
  const context = new Map<string, any>() // Stores output of each node
  const reporter = options?.reporter

  try {
    reporter?.emit({ type: "run:start", startedAt: startTime })
    // Sort nodes in execution order
    const sortedNodes = topologicalSort(graphData.nodes, graphData.edges)

    // Execute each node
    for (const node of sortedNodes) {
      const nodeStartTime = Date.now()
      reporter?.emit({ type: "node:start", nodeId: node.id, label: node.data?.label, startedAt: nodeStartTime })

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
          case "inspect":
            output = await executeInspectNode(node, context, inputs)
            break
          case "setValue":
            output = await executeSetValueNode(node, context)
            break
          case "page":
            output = await executePageNode(node, context)
            break
          case "actionTrigger":
            output = await executeActionTriggerNode(node, context, inputs)
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

        const { preview, bytes } = buildPreview(output)
        reporter?.emit({ type: "node:output", nodeId: node.id, preview, bytes })
        reporter?.emit({ type: "node:complete", nodeId: node.id, durationMs: Date.now() - nodeStartTime })
      } catch (error) {
        // Record error for this node
        nodeResults.push({
          nodeId: node.id,
          output: null,
          error: error instanceof Error ? error.message : "Unknown error",
          executionTime: Date.now() - nodeStartTime,
        })

        reporter?.emit({
          type: "node:error",
          nodeId: node.id,
          error: error instanceof Error ? error.message : "Unknown error",
        })
        // Stop execution on error
        throw error
      }
    }

    // Get the final output (output of the last node)
    const lastNode = sortedNodes[sortedNodes.length - 1]
    const finalOutput = lastNode ? context.get(lastNode.id) : null

    const result: FlowExecutionResult = {
      success: true,
      finalOutput,
      nodeResults,
      totalExecutionTime: Date.now() - startTime,
    }
    reporter?.emit({
      type: "run:complete",
      durationMs: result.totalExecutionTime,
      outputs: lastNode ? { [lastNode.id]: finalOutput } : {},
    })
    return result
  } catch (error) {
    const result = {
      success: false,
      finalOutput: null,
      nodeResults,
      totalExecutionTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    }
    reporter?.emit({
      type: "run:error",
      error: result.error as string,
      durationMs: result.totalExecutionTime,
    })
    return result
  }
}

/**
 * Get inputs for a node as a flat array of upstream node outputs.
 * This is the default input gathering mechanism for the single-value node model.
 * 
 * @param nodeId - The target node ID
 * @param edges - Graph edges
 * @param context - Execution context map (nodeId -> output value)
 * @returns Array of upstream node outputs (order not semantically significant)
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

/**
 * Get inputs for a node grouped by target handle ID.
 * 
 * This utility supports future labeled multi-port nodes where a single node
 * can have multiple distinct input ports (e.g., "data", "config", "trigger").
 * 
 * **Current Usage**: NOT USED YET. All existing nodes use the default single-value
 * model via `getNodeInputs`. This function is staged for future extensibility.
 * 
 * **How it works**:
 * - Edges may specify a `targetHandle` ID indicating which input port they connect to
 * - Edges without a `targetHandle` are grouped under the "_default" key
 * - Returns a map of handleId -> array of values from edges targeting that handle
 * 
 * **When to use**:
 * - When implementing advanced nodes with labeled input ports
 * - When a node needs to distinguish between different kinds of inputs
 * 
 * **Example**:
 * ```ts
 * // A hypothetical "Merge" node with two labeled inputs: "primary" and "secondary"
 * const inputsByHandle = getNodeInputsByHandle(nodeId, edges, context)
 * const primaryData = inputsByHandle["primary"]?.[0] // first input to "primary" port
 * const secondaryData = inputsByHandle["secondary"]?.[0] // first input to "secondary" port
 * ```
 * 
 * @param nodeId - The target node ID
 * @param edges - Graph edges (may include `targetHandle` property)
 * @param context - Execution context map (nodeId -> output value)
 * @returns Record mapping handle IDs to arrays of input values
 */
export function getNodeInputsByHandle(
  nodeId: string,
  edges: any[],
  context: Map<string, any>
): Record<string, any[]> {
  const inputsByHandle: Record<string, any[]> = {}

  // Find all edges that target this node
  const incomingEdges = edges.filter((edge) => edge.target === nodeId)

  // Group inputs by target handle
  for (const edge of incomingEdges) {
    const sourceOutput = context.get(edge.source)
    if (sourceOutput !== undefined) {
      const handleId = edge.targetHandle || "_default"
      if (!inputsByHandle[handleId]) {
        inputsByHandle[handleId] = []
      }
      inputsByHandle[handleId].push(sourceOutput)
    }
  }

  return inputsByHandle
}

