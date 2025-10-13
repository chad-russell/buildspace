"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { PageStateField } from "@/lib/types/dataflow"

interface PageStateContextValue {
  pageState: Record<string, any>
  updateState: (updates: Partial<Record<string, any>>) => void
  triggerAction: (actionName: string) => Promise<{ success: boolean; error?: string }>
}

const PageStateContext = createContext<PageStateContextValue | null>(null)

interface PageStateProviderProps {
  children: React.ReactNode
  stateSchema: PageStateField[]
  projectId: string
}

export function PageStateProvider({
  children,
  stateSchema,
  projectId,
}: PageStateProviderProps) {
  // Initialize state from schema defaults
  const [pageState, setPageState] = useState<Record<string, any>>(() => {
    const initialState: Record<string, any> = {}
    stateSchema.forEach((field) => {
      initialState[field.key] = field.defaultValue
    })
    return initialState
  })

  const updateState = useCallback((updates: Partial<Record<string, any>>) => {
    setPageState((prev) => ({ ...prev, ...updates }))
  }, [])

  const triggerAction = useCallback(
    async (actionName: string) => {
      try {
        const response = await fetch(
          `/api/dataflows/${projectId}/actions/${actionName}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              statePayload: pageState,
            }),
          }
        )

        const result = await response.json()

        if (result.success && result.newState) {
          // Merge returned state updates
          updateState(result.newState)
        }

        return {
          success: result.success,
          error: result.error,
        }
      } catch (error) {
        console.error("Error triggering action:", error)
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    },
    [pageState, projectId, updateState]
  )

  return (
    <PageStateContext.Provider value={{ pageState, updateState, triggerAction }}>
      {children}
    </PageStateContext.Provider>
  )
}

export function usePageState() {
  const context = useContext(PageStateContext)
  if (!context) {
    throw new Error("usePageState must be used within a PageStateProvider")
  }
  return context
}

