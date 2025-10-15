"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { CustomComponentEditor } from "@/components/custom-component/CustomComponentEditor"
import { CustomComponent } from "@/lib/db/schema"

export default function CustomComponentEditorPage() {
  const params = useParams()
  const componentId = params.id as string
  const [component, setComponent] = useState<CustomComponent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (componentId === "new") {
      setLoading(false)
      return
    }

    async function fetchComponent() {
      try {
        const response = await fetch(`/api/custom-components/${componentId}`)
        if (response.ok) {
          const data = await response.json()
          setComponent(data)
        } else {
          console.error("Failed to fetch component")
        }
      } catch (error) {
        console.error("Error fetching component:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchComponent()
  }, [componentId])

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p className="text-gray-500">Loading component...</p>
      </div>
    )
  }

  if (componentId === "new") {
    return (
      <CustomComponentEditor
        componentId={null}
        initialName=""
        initialPropsSchema={[]}
        initialPuckData={{ content: [], root: { props: {} } }}
      />
    )
  }

  if (!component) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p className="text-red-500">Component not found</p>
      </div>
    )
  }

  return (
    <CustomComponentEditor
      componentId={component.id}
      initialName={component.name}
      initialPropsSchema={component.propsSchema}
      initialPuckData={component.puckData}
    />
  )
}

