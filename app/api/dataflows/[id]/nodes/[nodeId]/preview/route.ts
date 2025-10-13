import { NextRequest, NextResponse } from "next/server"
import { executeHttpRequestNode } from "@/lib/executor/nodes/http-request-executor"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; nodeId: string } }
) {
  try {
    const { nodeId } = params
    const { nodeData } = await request.json()

    if (!nodeData) {
      return NextResponse.json(
        { error: "Node data is required" },
        { status: 400 }
      )
    }

    // Create a minimal node structure for execution
    const node = {
      id: nodeId,
      type: "httpRequest",
      data: nodeData,
      position: { x: 0, y: 0 },
    }

    // Execute the HTTP request (no context needed for preview)
    const context = new Map<string, any>()
    const result = await executeHttpRequestNode(node, context)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error fetching preview:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch preview",
      },
      { status: 500 }
    )
  }
}

