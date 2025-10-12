import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { dataFlows } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

// GET /api/dataflows - List all DataFlows
export async function GET() {
  try {
    const flows = await db.select().from(dataFlows)
    return NextResponse.json(flows)
  } catch (error) {
    console.error("Error fetching dataflows:", error)
    return NextResponse.json(
      { error: "Failed to fetch dataflows" },
      { status: 500 }
    )
  }
}

// POST /api/dataflows - Create new DataFlow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, userId, graphData } = body

    if (!name || !userId) {
      return NextResponse.json(
        { error: "Name and userId are required" },
        { status: 400 }
      )
    }

    // Initialize with empty graph if not provided
    const initialGraphData = graphData || { nodes: [], edges: [] }

    const newFlow = await db
      .insert(dataFlows)
      .values({
        name,
        userId,
        graphData: initialGraphData,
      })
      .returning()

    return NextResponse.json(newFlow[0], { status: 201 })
  } catch (error) {
    console.error("Error creating dataflow:", error)
    return NextResponse.json(
      { error: "Failed to create dataflow" },
      { status: 500 }
    )
  }
}

