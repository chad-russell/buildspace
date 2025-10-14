"use client"

import React, { useCallback, useRef, useEffect, useMemo } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
} from "reactflow"
import "reactflow/dist/style.css"

import { useDataFlowStore } from "@/lib/stores/dataflow-store"
import { nodeTypes } from "./nodes"
import { NodeSidebar } from "./NodeSidebar"
import { PropertiesPanel } from "./PropertiesPanel"
import { useRunStore } from "@/lib/stores/run-store"
import { ConsoleDrawer } from "./ConsoleDrawer"

export function FlowEditor() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    selectNode,
  } = useDataFlowStore()

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null)
  const { applyEvent, start: startRun } = useRunStore()
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  // Memoize nodeTypes to prevent React Flow warning about recreating the object
  const memoizedNodeTypes = useMemo(() => nodeTypes, [])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData("application/reactflow")

      if (typeof type === "undefined" || !type) {
        return
      }

      const position = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      // Generate unique ID by finding the highest existing counter for this type
      const existingIds = nodes
        .filter((n) => n.type === type)
        .map((n) => {
          const match = n.id.match(new RegExp(`^${type}-(\\d+)$`))
          return match ? parseInt(match[1], 10) : -1
        })
      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : -1
      const newId = `${type}-${maxId + 1}`

      const newNode = {
        id: newId,
        type,
        position,
        data:
          type === "page"
            ? {
                label: "New Page",
                slug: "new-page",
                pageState: [],
              }
            : type === "actionTrigger"
            ? {
                label: "Action Trigger",
                actionName: "",
                namedInputs: [],
              }
            : type === "setValue"
            ? {
                label: "Set Value",
                target: null,
                value: null,
              }
            : {
                label: type.charAt(0).toUpperCase() + type.slice(1),
              },
      }

      addNode(newNode)
    },
    [reactFlowInstance, addNode, nodes]
  )

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      selectNode(node)
    },
    [selectNode]
  )

  const onPaneClick = useCallback(() => {
    selectNode(null)
  }, [selectNode])

  // Expose a startRunStream function via window for now; actual trigger done from page Test Run
  useEffect(() => {
    ;(window as any).startRunStream = (flowId: string) => {
      startRun()
      setDrawerOpen(true)
      const es = new EventSource(`/api/dataflows/${flowId}/execute/stream`)

      const names = [
        "run-start",
        "node-start",
        "node-output",
        "node-complete",
        "node-error",
        "run-complete",
        "run-error",
      ] as const

      const handlers: Record<string, (ev: MessageEvent) => void> = {}
      names.forEach((n) => {
        handlers[n] = (ev: MessageEvent) => {
          try { applyEvent(JSON.parse(ev.data)) } catch {}
          if (n === "run-complete" || n === "run-error") {
            es.close()
          }
        }
        es.addEventListener(n, handlers[n])
      })

      // Fallback for any unnamed messages
      es.onmessage = (ev) => {
        try { applyEvent(JSON.parse(ev.data)) } catch {}
      }
    }
  }, [applyEvent, startRun])

  return (
    <div className="flex h-screen w-full">
      <NodeSidebar />
      
      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={memoizedNodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      <PropertiesPanel />
      <ConsoleDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}

