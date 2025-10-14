// Core DataFlow types for React Flow

export interface DataFlowNode {
  id: string
  type: string
  position: {
    x: number
    y: number
  }
  data: Record<string, any>
}

export interface DataFlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface DataFlowGraph {
  nodes: DataFlowNode[]
  edges: DataFlowEdge[]
}

// Node type definitions
export type NodeType = "data" | "httpRequest" | "select" | "inspect" | "page" | "actionTrigger" | "setValue"

// Specific node data types
export type JsonPathRef = [{ id: string }, ...(string | number)[]]
export type JsonExpr = { $ref: JsonPathRef } | unknown
export interface DataNodeData {
  label: string
  jsonData: JsonExpr
}

export interface HttpRequestNodeData {
  label: string
  url: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  headers: Record<string, string>
  body?: string
  queryParams: Record<string, string>
  previewData?: any // Stores fetched preview response for design-time binding
}

export interface SelectNodeData {
  label: string
  fields: string[] // Array of JSON paths to select
  renameMap?: Record<string, string> // Optional field renaming
}

export interface InspectNodeData {
  label: string
  // Inspect node doesn't need configuration, it just visualizes input
}

export interface PageStateField {
  key: string
  defaultValue: any
  type?: "string" | "number" | "boolean" | "object"
}

export interface PageNodeData {
  label: string
  slug: string
  pageState?: PageStateField[]
  puckData?: {
    content: any[]
    root: any
    zones?: any
  }
}

export interface ActionTriggerNodeData {
  label: string
  actionName: string
}

export interface SetValueNodeData {
  label: string
  target: JsonExpr | null  // Reference to path in another node
  value: JsonExpr          // Can be literal or reference
}

// Execution result types
export interface NodeExecutionResult {
  nodeId: string
  output: any
  error?: string
  executionTime: number
}

export interface FlowExecutionResult {
  success: boolean
  finalOutput: any
  nodeResults: NodeExecutionResult[]
  totalExecutionTime: number
  error?: string
}

