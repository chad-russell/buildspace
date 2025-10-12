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
export type NodeType = "data" | "httpRequest" | "select" | "inspect"

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

