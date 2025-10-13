import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { dataFlows } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; pageNodeId: string } }
) {
  try {
    const { id: flowId, pageNodeId } = params
    const { puckData } = await request.json()

    // Load the dataflow from the database
    const flows = await db
      .select()
      .from(dataFlows)
      .where(eq(dataFlows.id, flowId))
      .limit(1)

    if (flows.length === 0) {
      return NextResponse.json(
        { error: "Dataflow not found" },
        { status: 404 }
      )
    }

    const flow = flows[0]
    const graphData = flow.graphData

    // Find the page node
    const nodeIndex = graphData.nodes.findIndex(
      (node: any) => node.id === pageNodeId
    )

    if (nodeIndex === -1) {
      return NextResponse.json({ error: "Page node not found" }, { status: 404 })
    }

    // Update the page node's puckData
    graphData.nodes[nodeIndex].data = {
      ...graphData.nodes[nodeIndex].data,
      puckData,
    }

    // Save back to database
    await db
      .update(dataFlows)
      .set({
        graphData,
        updatedAt: new Date(),
      })
      .where(eq(dataFlows.id, flowId))

    return NextResponse.json({
      success: true,
      message: "Page design saved successfully",
    })
  } catch (error) {
    console.error("Error saving page design:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

