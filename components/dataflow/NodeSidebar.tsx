"use client"

import React from "react"
import { Database, Globe, Filter, Eye, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const nodeDefinitions = [
  {
    type: "data",
    label: "Data",
    icon: Database,
    description: "Static JSON data",
    color: "bg-green-500",
  },
  {
    type: "httpRequest",
    label: "HTTP Request",
    icon: Globe,
    description: "Make API calls",
    color: "bg-blue-500",
  },
  {
    type: "select",
    label: "Select",
    icon: Filter,
    description: "Pick JSON fields",
    color: "bg-purple-500",
  },
  {
    type: "inspect",
    label: "Inspect",
    icon: Eye,
    description: "Visualize data",
    color: "bg-orange-500",
  },
  {
    type: "page",
    label: "Page",
    icon: FileText,
    description: "Application page",
    color: "bg-purple-500",
  },
]

export function NodeSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <Card className="w-64 h-full border-r">
      <CardHeader>
        <CardTitle className="text-lg">Nodes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {nodeDefinitions.map((node) => {
          const Icon = node.icon
          return (
            <div
              key={node.type}
              draggable
              onDragStart={(e) => onDragStart(e, node.type)}
              className="flex items-start gap-3 p-3 border rounded-lg cursor-move hover:border-gray-400 hover:shadow-sm transition-all"
            >
              <div className={`p-2 rounded ${node.color} text-white`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{node.label}</div>
                <div className="text-xs text-gray-500">{node.description}</div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

