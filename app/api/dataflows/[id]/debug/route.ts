import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { dataFlows } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

// Debug endpoint to see raw dataflow data
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

    const graphData = flow[0].graphData as any
    const pageNodes = graphData.nodes.filter((n: any) => n.type === "page")

    return NextResponse.json({
      flowName: flow[0].name,
      totalNodes: graphData.nodes.length,
      pageNodes: pageNodes.map((n: any) => ({
        id: n.id,
        label: n.data.label,
        slug: n.data.slug,
        pageState: n.data.pageState,
        hasPuckData: !!n.data.puckData,
      })),
      rawGraphData: graphData,
    })
  } catch (error) {
    console.error("Error fetching debug data:", error)
    return NextResponse.json(
      { error: "Failed to fetch debug data" },
      { status: 500 }
    )
  }
}

