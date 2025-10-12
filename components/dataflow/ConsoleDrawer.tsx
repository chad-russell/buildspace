"use client"

import React from "react"
import { useRunStore } from "@/lib/stores/run-store"
import { Button } from "@/components/ui/button"

interface ConsoleDrawerProps {
  open: boolean
  onClose: () => void
}

export function ConsoleDrawer({ open, onClose }: ConsoleDrawerProps) {
  const { events, outputs } = useRunStore()

  if (!open) return null

  return (
    <div className="absolute bottom-0 left-0 right-0 h-64 border-t bg-white shadow-xl flex flex-col">
      <div className="h-10 px-3 border-b flex items-center justify-between">
        <div className="text-sm font-medium">Run Console</div>
        <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
      </div>
      <div className="flex-1 overflow-auto text-xs p-3">
        {events.map((e, i) => (
          <div key={i} className="mb-1">
            <code className="text-gray-700">{JSON.stringify(e)}</code>
          </div>
        ))}
      </div>
    </div>
  )
}


