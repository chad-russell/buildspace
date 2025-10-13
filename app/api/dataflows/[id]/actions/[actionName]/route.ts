import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { dataflows } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { executeActionFlow } from "@/lib/executor/action-executor"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; actionName: string } }
) {
  try {
    const { id, actionName } = params
    const body = await request.json()
    const { statePayload } = body

    if (!statePayload || typeof statePayload !== "object") {
      return NextResponse.json(
        { error: "Invalid state payload" },
        { status: 400 }
      )
    }

    // Load the dataflow from the database
    const [dataflow] = await db
      .select()
      .from(dataflows)
      .where(eq(dataflows.id, id))
      .limit(1)

    if (!dataflow) {
      return NextResponse.json({ error: "Dataflow not found" }, { status: 404 })
    }

    const graphData = dataflow.graphData as any

    // Find the action trigger node by actionName
    const actionTriggerNode = graphData.nodes.find(
      (node: any) =>
        node.type === "actionTrigger" && node.data.actionName === actionName
    )

    if (!actionTriggerNode) {
      return NextResponse.json(
        { error: `Action "${actionName}" not found` },
        { status: 404 }
      )
    }

    // Map state to action inputs based on stateMapping
    const stateMapping = actionTriggerNode.data.stateMapping || {}
    const actionInputs: Record<string, any> = {}

    for (const [inputKey, stateKey] of Object.entries(stateMapping)) {
      actionInputs[inputKey] = statePayload[stateKey as string]
    }

    // Execute the action flow starting from the trigger node
    const result = await executeActionFlow(
      graphData,
      actionTriggerNode.id,
      actionInputs
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        newState: result.finalOutput,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Action execution failed",
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error executing action:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

