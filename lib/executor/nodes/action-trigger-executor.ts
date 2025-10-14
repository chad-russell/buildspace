import { DataFlowNode } from "@/lib/types/dataflow"

/**
 * Execute an Action Trigger node.
 * 
 * **Input Consumption**: CONSUMES ALL INPUTS (merges or arrays).
 * 
 * **Behavior**: Used as the terminal node in action flows. When triggered from
 * the UI (e.g., button click), the action executor evaluates all upstream nodes
 * and derives the final result from this node's inputs:
 * - Single input → return it directly
 * - Multiple plain objects → shallow merge left-to-right
 * - Otherwise → return array of inputs
 * 
 * **Output**: First input if available, undefined otherwise.
 * 
 * **Note**: The action-executor.ts actually implements the merge/array logic;
 * this executor just returns the first input. The action flow result prefers
 * the Page node's updated state when present.
 */
export async function executeActionTriggerNode(
  node: DataFlowNode,
  context: Map<string, any>,
  inputs: any[]
): Promise<any> {
  // Action trigger nodes don't produce output themselves
  // They just trigger execution. Return the first input or undefined.
  return inputs.length > 0 ? inputs[0] : undefined
}

