import { DataFlowNode } from "@/lib/types/dataflow"

export async function executeActionTriggerNode(
  node: DataFlowNode,
  context: Map<string, any>,
  inputs: any[]
): Promise<any> {
  // Action trigger nodes don't produce output themselves
  // They just trigger execution. Return the first input or undefined.
  return inputs.length > 0 ? inputs[0] : undefined
}

