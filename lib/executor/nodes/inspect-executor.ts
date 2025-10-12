import { DataFlowNode } from "@/lib/types/dataflow"

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

