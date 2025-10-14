import { DataFlowNode } from "@/lib/types/dataflow"

/**
 * Execute an HTTP Request node.
 * 
 * **Input Consumption**: IGNORES inputs (config-driven).
 * 
 * **Behavior**: Makes an HTTP request using the configured URL, method, headers,
 * body, and query parameters. Configuration values may contain $ref references
 * (resolved before this executor runs).
 * 
 * **Output**: Parsed JSON response if content-type is application/json, otherwise text.
 */
export async function executeHttpRequestNode(
  node: DataFlowNode,
  context: Map<string, any>
): Promise<any> {
  const { url, method = "GET", headers = {}, body, queryParams = {} } = node.data

  if (!url) {
    throw new Error("URL is required for HTTP Request node")
  }

  // Build query string
  const queryString = new URLSearchParams(queryParams).toString()
  const fullUrl = queryString ? `${url}?${queryString}` : url

  // Prepare fetch options
  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  }

  if (body && method !== "GET" && method !== "HEAD") {
    fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body)
  }

  try {
    const response = await fetch(fullUrl, fetchOptions)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get("content-type")
    if (contentType?.includes("application/json")) {
      return await response.json()
    } else {
      return await response.text()
    }
  } catch (error) {
    throw new Error(`HTTP Request failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

