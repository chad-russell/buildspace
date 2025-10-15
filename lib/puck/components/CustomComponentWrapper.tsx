"use client"

import React, { useState, useEffect } from "react"
import { Render, Data } from "@measured/puck"
import { puckConfig } from "@/lib/puck/config"
import { CustomComponent } from "@/lib/db/schema"
import { useCollectionItemProps } from "@/lib/puck/context/CollectionItemContext"

interface CustomComponentWrapperProps {
  componentId: string
  props: Record<string, any>
  puck?: any
}

/**
 * Wrapper component that renders custom components at runtime
 * Fetches the component definition and renders it with resolved props
 */
export function CustomComponentWrapper({
  componentId,
  props,
  puck,
}: CustomComponentWrapperProps) {
  const [component, setComponent] = useState<CustomComponent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if we're inside a Collection and get the item props
  let collectionItemProps: Record<string, any> | null = null
  try {
    collectionItemProps = useCollectionItemProps()
  } catch {
    // Not in a Collection context
  }

  useEffect(() => {
    async function fetchComponent() {
      try {
        const response = await fetch(`/api/custom-components/${componentId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch component")
        }
        const data = await response.json()
        setComponent(data)
      } catch (err) {
        console.error("Error fetching custom component:", err)
        setError("Failed to load component")
      } finally {
        setLoading(false)
      }
    }

    fetchComponent()
  }, [componentId])

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded">
        <p className="text-sm text-gray-500">Loading component...</p>
      </div>
    )
  }

  if (error || !component) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-sm text-red-600">
          {error || "Component not found"}
        </p>
      </div>
    )
  }

  // Helper function to convert string values to boolean (same logic as CheckboxComponent)
  const toBool = (val: any): boolean => {
    if (typeof val === "boolean") return val
    if (typeof val === "number") return val !== 0
    if (typeof val === "string") {
      const lower = val.toLowerCase().trim()
      return lower === "true" || lower === "yes"
    }
    return false
  }

  // Resolve component props - supports @ syntax for collection items
  // This allows mixing static values and dynamic collection item props
  const effectiveProps: Record<string, any> = {}
  
  Object.entries(props).forEach(([key, value]) => {
    // Skip internal Puck props
    if (key === 'id' || key === 'puck' || key === 'editMode') {
      return
    }

    // Find the prop definition to check if it's a boolean type
    const propDef = component.propsSchema.find((p) => p.key === key)
    
    // If value uses @props syntax and we're in a Collection, resolve from collection item
    if (typeof value === 'string' && collectionItemProps) {
      if (value === '@props') {
        // Return the entire collection item
        effectiveProps[key] = collectionItemProps
      } else if (value.startsWith('@props.')) {
        // Return a specific property
        const propKey = value.slice('@props.'.length)
        const resolvedValue = collectionItemProps[propKey] ?? value
        // Convert to boolean if the prop type is boolean
        effectiveProps[key] = propDef?.type === 'boolean' ? toBool(resolvedValue) : resolvedValue
      } else {
        // Use the configured value (static text, @pageState, @inputs, etc.)
        // Convert to boolean if the prop type is boolean and it's a static value (no @ prefix)
        if (propDef?.type === 'boolean' && !value.startsWith('@')) {
          effectiveProps[key] = toBool(value)
        } else {
          effectiveProps[key] = value
        }
      }
    } else {
      // Use the configured value (static text, @pageState, @inputs, etc.)
      // Convert to boolean if the prop type is boolean and it's a static value (no @ prefix)
      if (propDef?.type === 'boolean' && typeof value === 'string' && !value.startsWith('@')) {
        effectiveProps[key] = toBool(value)
      } else {
        effectiveProps[key] = value
      }
    }
  })
  
  // Merge with existing metadata to preserve markedInputs etc.
  const metadata = {
    ...( puck?.metadata || {}),
    componentProps: effectiveProps,
  }

  return (
    <div className="custom-component-wrapper" style={{ minHeight: '20px', display: 'block' }}>
      <Render
        config={puckConfig}
        data={component.puckData}
        metadata={metadata}
      />
    </div>
  )
}

