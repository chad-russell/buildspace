"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Plus, Workflow, Calendar, Box, Edit, Trash2 } from "lucide-react"
import { CustomComponent } from "@/lib/db/schema"

interface DataFlow {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  graphData: {
    nodes: any[]
    edges: any[]
  }
}

export default function BuildPage() {
  const [flows, setFlows] = useState<DataFlow[]>([])
  const [components, setComponents] = useState<CustomComponent[]>([])
  const [loading, setLoading] = useState(true)
  const [componentsLoading, setComponentsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchFlows()
    fetchComponents()
  }, [])

  const fetchFlows = async () => {
    try {
      const response = await fetch("/api/dataflows")
      if (response.ok) {
        const data = await response.json()
        setFlows(data)
      }
    } catch (error) {
      console.error("Error fetching flows:", error)
    } finally {
      setLoading(false)
    }
  }

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
      setComponentsLoading(false)
    }
  }

  const createNewFlow = async () => {
    try {
      // Create a placeholder user for POC (in production, use auth)
      const response = await fetch("/api/dataflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Untitled",
          userId: "placeholder-user-id", // TODO: Replace with actual user ID from auth
          graphData: { nodes: [], edges: [] },
        }),
      })

      if (response.ok) {
        const newFlow = await response.json()
        router.push(`/build/dataflow/${newFlow.id}`)
      }
    } catch (error) {
      console.error("Error creating flow:", error)
    }
  }

  const openFlow = (flowId: string) => {
    router.push(`/build/dataflow/${flowId}`)
  }

  const handleEditFlow = (flowId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/build/dataflow/${flowId}`)
  }

  const handleDeleteFlow = async (flowId: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/dataflows/${flowId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFlows(flows.filter((f) => f.id !== flowId))
      } else {
        alert("Failed to delete application")
      }
    } catch (error) {
      console.error("Error deleting application:", error)
      alert("Error deleting application")
    }
  }

  const handleCreateComponent = () => {
    router.push("/build/custom-components/new")
  }

  const handleEditComponent = (id: string) => {
    router.push(`/build/custom-components/${id}`)
  }

  const handleDeleteComponent = async (id: string, name: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">BuildSpace</h1>
          <p className="text-gray-600 mt-2">
            Visual computation and application development
          </p>
        </div>

        {/* Component Library section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Component Library</h2>
            <Button variant="outline" size="sm" onClick={handleCreateComponent}>
              <Plus className="w-4 h-4 mr-2" />
              New Component
            </Button>
          </div>
          
          {componentsLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Loading components...</p>
            </div>
          ) : components.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="max-w-md mx-auto">
                <Box className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  No custom components yet
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create reusable UI components for your pages.
                </p>
                <Button size="sm" onClick={handleCreateComponent}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Component
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {components.map((component) => (
                <Card key={component.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
                      {component.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {component.propsSchema.length} prop
                      {component.propsSchema.length !== 1 ? "s" : ""} · {component.puckData.content.length} element
                      {component.puckData.content.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {component.propsSchema.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {component.propsSchema.slice(0, 3).map((prop) => (
                          <span
                            key={prop.key}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                          >
                            {prop.key}
                          </span>
                        ))}
                        {component.propsSchema.length > 3 && (
                          <span className="text-xs text-gray-500 px-1">
                            +{component.propsSchema.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditComponent(component.id)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComponent(component.id, component.name)}
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Applications</h2>
          <Button variant="outline" size="sm" onClick={createNewFlow}>
            <Plus className="w-4 h-4 mr-2" />
            New App
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading flows...</p>
          </div>
        ) : flows.length === 0 ? (
          <div className="text-center py-12">
            <Workflow className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No DataFlows yet</h2>
            <p className="text-gray-500 mb-6">
              Create your first DataFlow to get started
            </p>
            <Button onClick={createNewFlow}>
              <Plus className="w-4 h-4 mr-2" />
              New App
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {flows.map((flow) => (
              <Card
                key={flow.id}
                className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openFlow(flow.id)}
              >
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-1 truncate flex items-center gap-2">
                    <Workflow className="w-4 h-4" />
                    {flow.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {flow.graphData.nodes.length} node{flow.graphData.nodes.length !== 1 ? "s" : ""} · {flow.graphData.edges.length} connection{flow.graphData.edges.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="mb-3">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    Updated {new Date(flow.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => handleEditFlow(flow.id, e)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteFlow(flow.id, flow.name, e)}
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
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

