import { DataFlowNode } from "@/lib/types/dataflow"

/**
 * Execute an Inspect node.
 * 
 * **Input Consumption**: CONSUMES FIRST INPUT ONLY.
 * 
 * **Behavior**: A pass-through node that returns the first input value unchanged.
 * Used primarily for visualization/debugging in the UI (the runner emits the value
 * as a preview).
 * 
 * **Output**: The first input value, or undefined if no inputs.
 */
export async function executeInspectNode(
  node: DataFlowNode,
  context: Map<string, any>,
  inputs: any[]
): Promise<any> {
  // Inspect node simply passes through its input
  // In a real implementation, this might log or store the data for debugging
  const inputData = inputs[0]
  
  // Log for server-side debugging
  console.log(`[Inspect Node: ${node.data.label}]`, inputData)
  
  // Return the input unchanged
  return inputData
}

