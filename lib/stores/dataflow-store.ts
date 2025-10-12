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

interface DataFlowState {
  nodes: Node[]
  edges: Edge[]
  selectedNode: Node | null
  flowId: string | null
  flowName: string
  isSaving: boolean

  setFlowId: (id: string) => void
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
}

export const useDataFlowStore = create<DataFlowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  flowId: null,
  flowName: "Untitled Flow",
  isSaving: false,

  setFlowId: (id) => set({ flowId: id }),
  
  setFlowName: (name) => set({ flowName: name }),

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    })
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    })
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
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
      flowName: "Untitled Flow",
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
    
    set({ edges: newEdges })
  },
}))

