"use client"

import React, { useState, useEffect } from "react"
import { Render, Data } from "@measured/puck"
import { puckConfig } from "@/lib/puck/config"
import { CustomComponent } from "@/lib/db/schema"

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

  // Create metadata from the props passed to this component
  // This allows child components to access the custom component's props
  const metadata = {
    componentProps: props,
    ...(puck?.metadata || {}),
  }

  return (
    <div className="custom-component-wrapper">
      <Render
        config={puckConfig}
        data={component.puckData}
        metadata={metadata}
      />
    </div>
  )
}

