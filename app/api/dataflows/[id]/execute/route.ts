import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { dataFlows } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { executeDataFlow } from "@/lib/executor/executor"

// POST /api/dataflows/[id]/execute - Execute a DataFlow
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch the DataFlow from database
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

    const dataFlow = flow[0]

    // Validate that graphData exists
    if (!dataFlow.graphData) {
      return NextResponse.json(
        { error: "DataFlow has no graph data" },
        { status: 400 }
      )
    }

    // Execute the flow
    const result = await executeDataFlow(dataFlow.graphData as any)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error executing dataflow:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        finalOutput: null,
        nodeResults: [],
        totalExecutionTime: 0,
      },
      { status: 500 }
    )
  }
}

