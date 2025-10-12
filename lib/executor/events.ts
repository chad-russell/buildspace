// Utilities and types for streaming execution events over SSE

export type ExecutionEvent =
  | { type: "run:start"; startedAt: number; runId?: string }
  | { type: "node:start"; nodeId: string; label?: string; startedAt: number }
  | { type: "node:log"; nodeId: string; level: "info" | "warn" | "error"; message: string }
  | { type: "node:output"; nodeId: string; preview: unknown; bytes: number }
  | { type: "node:error"; nodeId: string; error: string }
  | { type: "node:complete"; nodeId: string; durationMs: number }
  | { type: "run:complete"; durationMs: number; outputs: Record<string, unknown> }
  | { type: "run:error"; error: string; durationMs: number }

export interface Reporter {
  emit: (event: ExecutionEvent) => void
}

const textEncoder = new TextEncoder()

// Convert an event object to SSE formatted bytes
export function encodeSSE(event: ExecutionEvent): Uint8Array {
  const eventName = event.type.replace(/:/g, "-")
  const payload = JSON.stringify(event)
  const data = `event: ${eventName}\n` + `data: ${payload}\n\n`
  return textEncoder.encode(data)
}

// Creates a heartbeat payload to keep the connection alive
export function heartbeat(): Uint8Array {
  return textEncoder.encode(`:\n\n`)
}

// Safely stringify a value for preview and limit by approximate bytes
export function buildPreview(value: unknown, maxBytes = 8_192): {
  preview: unknown
  bytes: number
} {
  try {
    const json = JSON.stringify(value)
    const bytes = new TextEncoder().encode(json).length
    if (bytes <= maxBytes) {
      return { preview: value, bytes }
    }

    // Truncate stringified version to fit limit
    const enc = new TextEncoder()
    let sliceEnd = json.length
    while (sliceEnd > 0 && enc.encode(json.slice(0, sliceEnd)).length > maxBytes) {
      sliceEnd = Math.floor(sliceEnd * 0.9)
    }
    const truncated = json.slice(0, sliceEnd) + "…"
    return { preview: { __truncated__: true, json: truncated }, bytes }
  } catch {
    return { preview: String(value), bytes: String(value).length }
  }
}


