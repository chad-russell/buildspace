import { DataFlowGraph } from "@/lib/types/dataflow"
import { executeWorkflow } from "./executor"
import { executePageNode } from "./nodes/page-executor"

/**
 * Resolve the initial state for a page node by executing its onLoad trigger workflow.
 * 
 * This function:
 * 1. Finds the page node by ID
 * 2. Gets its onLoadTriggerId (which ActionTrigger to run on page load)
 * 3. Pre-populates context with default Page State
 * 4. Executes the workflow starting from the onLoad trigger
 * 5. Returns the updated Page State (which may have been modified by SetValue nodes)
 * 
 * @param graphData - The full dataflow graph
 * @param pageNodeId - The ID of the page node to resolve state for
 * @returns The resolved page state object
 */
export async function resolvePageState(
  graphData: DataFlowGraph,
  pageNodeId: string
): Promise<Record<string, any>> {
  // Find the page node
  const pageNode = graphData.nodes.find((n) => n.id === pageNodeId)
  if (!pageNode) {
    throw new Error(`Page node ${pageNodeId} not found`)
  }

  // Get the onLoad trigger ID
  const onLoadTriggerId = pageNode.data.onLoadTriggerId as string | undefined
  
  // If no trigger specified, just return the default page state
  if (!onLoadTriggerId) {
    console.log('[PageStateResolver] No onLoad trigger specified, returning default state')
    const context = new Map<string, any>()
    const defaultState = await executePageNode(pageNode, context)
    return defaultState || {}
  }

  // Verify the trigger exists
  const triggerNode = graphData.nodes.find((n) => n.id === onLoadTriggerId)
  if (!triggerNode || triggerNode.type !== 'actionTrigger') {
    console.warn(`[PageStateResolver] onLoad trigger ${onLoadTriggerId} not found or not an ActionTrigger`)
    const context = new Map<string, any>()
    const defaultState = await executePageNode(pageNode, context)
    return defaultState || {}
  }

  // Pre-populate context with default page state
  const context = new Map<string, any>()
  const defaultPageState = await executePageNode(pageNode, context)
  context.set(pageNodeId, defaultPageState)
  
  console.log('[PageStateResolver] Executing onLoad trigger:', onLoadTriggerId)
  console.log('[PageStateResolver] Default page state:', defaultPageState)

  // Execute the workflow starting from the onLoad trigger
  const result = await executeWorkflow(graphData, onLoadTriggerId, context)

  if (!result.success) {
    throw new Error(`Failed to execute onLoad workflow: ${result.error}`)
  }

  // The context is returned as finalOutput in the new executor
  const executionContext = result.finalOutput as Map<string, any>
  
  // Return the (possibly updated) page state from the context
  const resolvedState = executionContext.get(pageNodeId)
  console.log('[PageStateResolver] Resolved page state:', resolvedState)
  
  return resolvedState || {}
}
