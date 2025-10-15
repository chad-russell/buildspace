"use client"

import React, { createContext, useContext } from "react"

type CollectionItemProps = Record<string, any>

const CollectionItemContext = createContext<CollectionItemProps | null>(null)

interface CollectionItemPropsProviderProps {
  value: CollectionItemProps
  children: React.ReactNode
}

export function CollectionItemPropsProvider({ value, children }: CollectionItemPropsProviderProps) {
  return (
    <CollectionItemContext.Provider value={value}>{children}</CollectionItemContext.Provider>
  )
}

export function useCollectionItemProps() {
  const context = useContext(CollectionItemContext)
  if (!context) {
    throw new Error("useCollectionItemProps must be used within a CollectionItemPropsProvider")
  }
  return context
}


