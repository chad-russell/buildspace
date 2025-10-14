import { DataFlowGraph, FlowExecutionResult, NodeExecutionResult } from "@/lib/types/dataflow"
import { topologicalSort } from "./topological-sort"
import { executeDataNode } from "./nodes/data-executor"
import { executeHttpRequestNode } from "./nodes/http-request-executor"
import { executeSelectNode } from "./nodes/select-executor"
import { executeInspectNode } from "./nodes/inspect-executor"
import { executeSetValueNode } from "./nodes/set-value-executor"
import { executePageNode } from "./nodes/page-executor"
import { executeActionTriggerNode } from "./nodes/action-trigger-executor"

/**
 * Execute an action flow by evaluating the upstream subgraph that feeds
 * the given Action Trigger node. No implicit state is injected.
 */
export async function executeActionFlow(
  graphData: DataFlowGraph,
  triggerNodeId: string
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

    // Determine all upstream nodes that can reach the trigger
    const upstreamNodes = getUpstreamNodes(graphData, triggerNodeId)
    console.log('[ActionExecutor] Upstream nodes found:', upstreamNodes.map(n => `${n.id} (${n.type})`))

    if (upstreamNodes.length > 0) {
      // Induce the subgraph edges among the upstream nodes
      const upstreamNodeIds = new Set(upstreamNodes.map((n) => n.id))
      const inducedEdges = graphData.edges.filter(
        (e) => upstreamNodeIds.has(e.source) && upstreamNodeIds.has(e.target)
      )

      // Sort upstream nodes in execution order
      const sortedNodes = topologicalSort(upstreamNodes, inducedEdges)

      // Execute each upstream node
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
    }

    // After execution, find the page node and return its updated state
    // This allows SetValue mutations to be reflected in the page state
    const pageNode = graphData.nodes.find((n) => n.type === "page")
    console.log('[ActionExecutor] Page node found:', pageNode?.id)
    console.log('[ActionExecutor] Context has page node:', pageNode ? context.has(pageNode.id) : false)
    
    let finalOutput: any
    
    if (pageNode && context.has(pageNode.id)) {
      // Return the updated page state from context
      finalOutput = context.get(pageNode.id)
      console.log('[ActionExecutor] Returning page state as final output:', finalOutput)
    } else {
      // Fallback: compute the value "at" the trigger node by gathering its inputs
      const triggerInputs = getNodeInputs(triggerNodeId, graphData.edges, context)
      finalOutput = deriveFinalOutput(triggerInputs)
      console.log('[ActionExecutor] Returning trigger inputs as final output:', finalOutput)
    }

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
 * Get all nodes upstream from a given node (can reach the target)
 */
function getUpstreamNodes(
  graphData: DataFlowGraph,
  startNodeId: string
): any[] {
  const visited = new Set<string>()
  const upstream: any[] = []

  function traverse(nodeId: string) {
    if (visited.has(nodeId)) return
    visited.add(nodeId)

    // Find all edges where this node is the target (incoming edges)
    const incomingEdges = graphData.edges.filter((edge) => edge.target === nodeId)

    for (const edge of incomingEdges) {
      const sourceNode = graphData.nodes.find((n) => n.id === edge.source)
      if (sourceNode && !upstream.find((n) => n.id === sourceNode.id)) {
        upstream.push(sourceNode)
        traverse(sourceNode.id)
      }
    }
  }

  traverse(startNodeId)
  return upstream
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

function isPlainObject(value: any): value is Record<string, any> {
  return (
    value !== null &&
    typeof value === "object" &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
  )
}

function deriveFinalOutput(inputs: any[]): any {
  if (inputs.length === 0) return undefined
  if (inputs.length === 1) return inputs[0]
  const allObjects = inputs.every(isPlainObject)
  if (allObjects) {
    return inputs.reduce((acc, obj) => Object.assign(acc, obj), {})
  }
  return inputs
}

