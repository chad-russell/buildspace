import { create } from "zustand"
import { DataFlowNode, DataFlowEdge } from "@/lib/types/dataflow"
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow"

// ensure any bogus handle ids ("null", "undefined", null, "") are removed
function sanitizeHandleId(id: any): string | undefined {
  if (id === undefined || id === null) return undefined
  if (id === "null" || id === "undefined" || id === "") return undefined
  return id as string
}

function sanitizeEdges(edges: Edge[]): Edge[] {
  return (edges || []).map((e: any) => ({
    ...e,
    sourceHandle: sanitizeHandleId(e?.sourceHandle),
    targetHandle: sanitizeHandleId(e?.targetHandle),
  }))
}

interface DataFlowState {
  nodes: Node[]
  edges: Edge[]
  selectedNode: Node | null
  flowId: string | null
  flowName: string
  isSaving: boolean

  setFlowId: (id: string | null) => void
  setFlowName: (name: string) => void
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  addNode: (node: Node) => void
  selectNode: (node: Node | null) => void
  updateNodeData: (nodeId: string, data: any) => void
  deleteNode: (nodeId: string) => void
  setIsSaving: (saving: boolean) => void
  reset: () => void
  ensureEdge: (source: string, target: string) => void
  getPageDependencies: (pageNodeId: string) => Node[]
}

export const useDataFlowStore = create<DataFlowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  flowId: null,
  flowName: "Untitled",
  isSaving: false,

  setFlowId: (id) => set({ flowId: id }),
  
  setFlowName: (name) => set({ flowName: name }),

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges: sanitizeEdges(edges) }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    })
  },

  onEdgesChange: (changes) => {
    const next = applyEdgeChanges(changes, get().edges)
    set({
      edges: sanitizeEdges(next),
    })
  },

  onConnect: (connection) => {
    const sanitized: Connection = {
      ...connection,
      sourceHandle: sanitizeHandleId((connection as any).sourceHandle),
      targetHandle: sanitizeHandleId((connection as any).targetHandle),
    }
    set({
      edges: addEdge(sanitized, get().edges),
    })
  },

  addNode: (node) => {
    set({
      nodes: [...get().nodes, node],
    })
  },

  selectNode: (node) => {
    set({ selectedNode: node })
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    })
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
      selectedNode:
        get().selectedNode?.id === nodeId ? null : get().selectedNode,
    })
  },

  setIsSaving: (saving) => set({ isSaving: saving }),

  reset: () =>
    set({
      nodes: [],
      edges: [],
      selectedNode: null,
      flowId: null,
      flowName: "Untitled",
      isSaving: false,
    }),

  ensureEdge: (source, target) => {
    // Prevent self-loops
    if (source === target) {
      console.warn(`Cannot create edge from ${source} to itself`)
      return
    }
    
    const existing = get().edges.some((e) => e.source === source && e.target === target)
    if (existing) return
    
    // Check if adding this edge would create a cycle
    // Do not set handle ids; let React Flow use defaults
    const newEdges = addEdge({ source, target }, get().edges)
    const nodes = get().nodes
    
    // Simple cycle detection: check if there's already a path from target to source
    const hasCycle = (from: string, to: string, edges: any[]): boolean => {
      if (from === to) return true
      const neighbors = edges.filter(e => e.source === from).map(e => e.target)
      return neighbors.some(n => hasCycle(n, to, edges))
    }
    
    if (hasCycle(target, source, get().edges)) {
      console.warn(`Cannot create edge from ${source} to ${target}: would create a cycle`)
      alert(`Cannot create this reference: it would create a circular dependency`)
      return
    }
    
    set({ edges: sanitizeEdges(newEdges) })
  },

  getPageDependencies: (pageNodeId) => {
    const { nodes, edges } = get()
    // Find all edges where the page node is the target
    const incomingEdges = edges.filter((edge) => edge.target === pageNodeId)
    // Get the source nodes
    const sourceNodeIds = incomingEdges.map((edge) => edge.source)
    return nodes.filter((node) => sourceNodeIds.includes(node.id))
  },
}))

