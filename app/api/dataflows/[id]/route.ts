import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { dataFlows } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

// GET /api/dataflows/[id] - Fetch DataFlow by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const flow = await db
      .select()
      .from(dataFlows)
      .where(eq(dataFlows.id, params.id))
      .limit(1)

    if (flow.length === 0) {
      return NextResponse.json(
        { error: "DataFlow not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(flow[0])
  } catch (error) {
    console.error("Error fetching dataflow:", error)
    return NextResponse.json(
      { error: "Failed to fetch dataflow" },
      { status: 500 }
    )
  }
}

// PUT /api/dataflows/[id] - Update DataFlow
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, graphData } = body

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (name !== undefined) {
      updateData.name = name
    }

    if (graphData !== undefined) {
      updateData.graphData = graphData
    }

    const updatedFlow = await db
      .update(dataFlows)
      .set(updateData)
      .where(eq(dataFlows.id, params.id))
      .returning()

    if (updatedFlow.length === 0) {
      return NextResponse.json(
        { error: "DataFlow not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedFlow[0])
  } catch (error) {
    console.error("Error updating dataflow:", error)
    return NextResponse.json(
      { error: "Failed to update dataflow" },
      { status: 500 }
    )
  }
}

// DELETE /api/dataflows/[id] - Delete DataFlow
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deletedFlow = await db
      .delete(dataFlows)
      .where(eq(dataFlows.id, params.id))
      .returning()

    if (deletedFlow.length === 0) {
      return NextResponse.json(
        { error: "DataFlow not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting dataflow:", error)
    return NextResponse.json(
      { error: "Failed to delete dataflow" },
      { status: 500 }
    )
  }
}

