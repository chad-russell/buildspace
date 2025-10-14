import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { dataFlows } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { executeActionFlow } from "@/lib/executor/action-executor"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; actionName: string } }
) {
  try {
    const { id, actionName } = params

    // Load the dataflow from the database
    const [dataflow] = await db
      .select()
      .from(dataFlows)
      .where(eq(dataFlows.id, id))
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

    // Execute the action flow starting from the trigger node
    const result = await executeActionFlow(
      graphData,
      actionTriggerNode.id
    )

    if (result.success) {
      const final = result.finalOutput
      console.log('[Action API] Final output:', final)
      const isPlainObject =
        final !== null && typeof final === "object" &&
        (Object.getPrototypeOf(final) === Object.prototype || Object.getPrototypeOf(final) === null)
      console.log('[Action API] Is plain object:', isPlainObject)
      const response = {
        success: true,
        ...(isPlainObject ? { newState: final } : {}),
      }
      console.log('[Action API] Sending response:', response)
      return NextResponse.json(response)
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

