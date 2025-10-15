import { DataFlowGraph, FlowExecutionResult } from "@/lib/types/dataflow"
import { executeWorkflow } from "./executor"

/**
 * Execute an action flow by finding the ActionTrigger node with the given name
 * and executing all downstream nodes in the workflow.
 * 
 * @param graphData - The full dataflow graph
 * @param actionName - The name of the action to trigger (from ActionTrigger.actionName)
 * @param currentPageState - Current runtime page state to inject into context
 * @returns Execution result with updated page state
 */
export async function executeActionFlow(
  graphData: DataFlowGraph,
  actionName: string,
  currentPageState?: Record<string, any>
): Promise<FlowExecutionResult> {
  const startTime = Date.now()

  try {
    // Find the ActionTrigger node by actionName
    const actionTriggerNode = graphData.nodes.find(
      (n) => n.type === "actionTrigger" && n.data.actionName === actionName
    )

    if (!actionTriggerNode) {
      throw new Error(`ActionTrigger with name "${actionName}" not found`)
    }

    console.log('[ActionExecutor] Found ActionTrigger:', actionTriggerNode.id, actionName)

    // Pre-populate context with current page state if provided
    const context = new Map<string, any>()
    
    if (currentPageState) {
      // Find the page node to inject state into
      const pageNode = graphData.nodes.find((n) => n.type === "page")
      if (pageNode) {
        console.log('[ActionExecutor] Pre-populating Page node with current state:', currentPageState)
        context.set(pageNode.id, currentPageState)
      }
    }

    // Execute the workflow starting from the ActionTrigger
    const result = await executeWorkflow(graphData, actionTriggerNode.id, context)

    if (!result.success) {
      return result
    }

    // The context is returned as finalOutput in the new executor
    const executionContext = result.finalOutput as Map<string, any>

    // Find the page node and return its updated state
    const pageNode = graphData.nodes.find((n) => n.type === "page")
    let finalOutput: any = undefined

    if (pageNode && executionContext.has(pageNode.id)) {
      // Return the updated page state from context
      finalOutput = executionContext.get(pageNode.id)
      console.log('[ActionExecutor] Returning updated page state:', finalOutput)
    } else {
      console.log('[ActionExecutor] No page state found, returning undefined')
    }

    return {
      ...result,
      finalOutput,
    }
  } catch (error) {
    return {
      success: false,
      finalOutput: null,
      nodeResults: [],
      totalExecutionTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
