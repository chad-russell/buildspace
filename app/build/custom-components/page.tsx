"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import { CustomComponent } from "@/lib/db/schema"

export default function CustomComponentsPage() {
  const router = useRouter()
  const [components, setComponents] = useState<CustomComponent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComponents()
  }, [])

  const fetchComponents = async () => {
    try {
      const response = await fetch("/api/custom-components?userId=placeholder-user-id")
      if (response.ok) {
        const data = await response.json()
        setComponents(data)
      }
    } catch (error) {
      console.error("Error fetching components:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    router.push("/build/custom-components/new")
  }

  const handleEdit = (id: string) => {
    router.push(`/build/custom-components/${id}`)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/custom-components/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setComponents(components.filter((c) => c.id !== id))
      } else {
        alert("Failed to delete component")
      }
    } catch (error) {
      console.error("Error deleting component:", error)
      alert("Error deleting component")
    }
  }

  const handleBack = () => {
    router.push("/build")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Build
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Custom Components
              </h1>
              <p className="text-gray-600 mt-2">
                Create and manage reusable components for your applications
              </p>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              New Component
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading components...</p>
          </div>
        ) : components.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No custom components yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first custom component to make reusable UI elements
                for your pages.
              </p>
              <Button onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Component
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((component) => (
              <Card key={component.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {component.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {component.propsSchema.length} prop
                      {component.propsSchema.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {component.propsSchema.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">Props:</p>
                    <div className="flex flex-wrap gap-1">
                      {component.propsSchema.map((prop) => (
                        <span
                          key={prop.key}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {prop.key}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 mb-4">
                  {component.puckData.content.length} element
                  {component.puckData.content.length !== 1 ? "s" : ""}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(component.id)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(component.id, component.name)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

