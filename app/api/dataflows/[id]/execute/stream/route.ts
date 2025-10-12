import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { dataFlows } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { executeDataFlow } from "@/lib/executor/executor"
import { Reporter, encodeSSE, heartbeat } from "@/lib/executor/events"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()

  // Basic reporter that writes events to the SSE stream
  const reporter: Reporter = {
    emit(event) {
      writer.write(encodeSSE(event))
    },
  }

  // Heartbeat interval
  const interval = setInterval(() => {
    writer.write(heartbeat())
  }, 15000)

  const abort = request.signal

  abort.addEventListener("abort", () => {
    clearInterval(interval)
    try {
      writer.close()
    } catch {}
  })

  ;(async () => {
    try {
      const flow = await db
        .select()
        .from(dataFlows)
        .where(eq(dataFlows.id, params.id))
        .limit(1)

      if (flow.length === 0) {
        reporter.emit({ type: "run:error", error: "DataFlow not found", durationMs: 0 })
        writer.close()
        return
      }

      const dataFlow = flow[0]
      if (!dataFlow.graphData) {
        reporter.emit({ type: "run:error", error: "DataFlow has no graph data", durationMs: 0 })
        writer.close()
        return
      }

      await executeDataFlow(dataFlow.graphData as any, { reporter, signal: abort })
    } catch (err) {
      reporter.emit({
        type: "run:error",
        error: err instanceof Error ? err.message : "Unknown error",
        durationMs: 0,
      })
    } finally {
      clearInterval(interval)
      try {
        writer.close()
      } catch {}
    }
  })()

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}


