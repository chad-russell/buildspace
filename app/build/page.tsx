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
import { Plus, Workflow, Calendar } from "lucide-react"

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
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchFlows()
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">BuildSpace</h1>
            <p className="text-gray-600 mt-2">
              Visual computation and application development
            </p>
          </div>
          <Button onClick={createNewFlow}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flows.map((flow) => (
              <Card
                key={flow.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => openFlow(flow.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="w-5 h-5" />
                    {flow.name}
                  </CardTitle>
                  <CardDescription>
                    {flow.graphData.nodes.length} nodes,{" "}
                    {flow.graphData.edges.length} connections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    Updated {new Date(flow.updatedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

