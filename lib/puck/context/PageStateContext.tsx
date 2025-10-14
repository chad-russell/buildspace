"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

interface PageStateContextValue {
  pageState: Record<string, any>
  updateState: (updates: Partial<Record<string, any>>) => void
  triggerAction: (actionName: string) => Promise<{ success: boolean; error?: string }>
}

const PageStateContext = createContext<PageStateContextValue | null>(null)

interface PageStateProviderProps {
  children: React.ReactNode
  initialState: Record<string, any>
  projectId: string
}

export function PageStateProvider({
  children,
  initialState,
  projectId,
}: PageStateProviderProps) {
  // Initialize state from the resolved initial state
  const [pageState, setPageState] = useState<Record<string, any>>(initialState)

  // Update internal state when initialState prop changes (e.g., after async resolution)
  React.useEffect(() => {
    setPageState(initialState)
  }, [initialState])

  const updateState = useCallback((updates: Partial<Record<string, any>>) => {
    setPageState((prev) => ({ ...prev, ...updates }))
  }, [])

  const triggerAction = useCallback(
    async (actionName: string) => {
      try {
        console.log('[PageState] Triggering action:', actionName)
        console.log('[PageState] Current page state:', pageState)
        const response = await fetch(
          `/api/dataflows/${projectId}/actions/${actionName}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ currentPageState: pageState }),
          }
        )

        const result = await response.json()
        console.log('[PageState] Action result:', result)

        if (result.success && result.newState) {
          console.log('[PageState] Updating state with:', result.newState)
          // Merge returned state updates
          updateState(result.newState)
        } else {
          console.log('[PageState] No newState returned or action failed')
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
    [projectId, pageState, updateState]
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

