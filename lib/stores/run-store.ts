"use client"

import { create } from "zustand"

type NodeState = "idle" | "queued" | "running" | "success" | "error"

export interface RunNodeStatus {
  state: NodeState
  durationMs?: number
  preview?: unknown
  error?: string
}

interface RunState {
  status: "idle" | "running" | "completed" | "error"
  nodes: Record<string, RunNodeStatus>
  logs: string[]
  events: any[]
  outputs: Record<string, unknown>
  start: () => void
  applyEvent: (e: any) => void
  reset: () => void
}

export const useRunStore = create<RunState>((set, get) => ({
  status: "idle",
  nodes: {},
  logs: [],
  events: [],
  outputs: {},

  start: () => set({ status: "running", logs: [], events: [], outputs: {}, nodes: {} }),

  applyEvent: (e: any) => {
    const { nodes } = get()
    switch (e.type) {
      case "run:start":
        set({ status: "running" })
        break
      case "node:start":
        nodes[e.nodeId] = { state: "running" }
        set({ nodes: { ...nodes } })
        break
      case "node:output":
        nodes[e.nodeId] = { ...(nodes[e.nodeId] || { state: "running" }), preview: e.preview }
        set({ nodes: { ...nodes } })
        break
      case "node:error":
        nodes[e.nodeId] = { ...(nodes[e.nodeId] || {}), state: "error", error: e.error }
        set({ nodes: { ...nodes } })
        break
      case "node:complete":
        nodes[e.nodeId] = { ...(nodes[e.nodeId] || {}), state: "success", durationMs: e.durationMs }
        set({ nodes: { ...nodes } })
        break
      case "run:complete":
        set({ status: "completed", outputs: e.outputs })
        break
      case "run:error":
        set({ status: "error" })
        break
      default:
        break
    }

    set({ events: [...get().events, e] })
  },

  reset: () => set({ status: "idle", nodes: {}, logs: [], events: [], outputs: {} }),
}))


