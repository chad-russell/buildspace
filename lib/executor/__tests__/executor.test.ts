/**
 * Unit tests for getNodeInputsByHandle utility.
 * 
 * NOTE: This project does not yet have a test framework configured.
 * To run these tests, add Jest or Vitest:
 * 
 * For Jest:
 *   npm install --save-dev jest @types/jest ts-jest
 *   npx jest --init
 *   Add "test": "jest" to package.json scripts
 * 
 * For Vitest:
 *   npm install --save-dev vitest
 *   Add "test": "vitest" to package.json scripts
 */

import { getNodeInputsByHandle } from "../executor"

describe("getNodeInputsByHandle", () => {
  it("groups single input with no handle id under _default", () => {
    const context = new Map([["node1", { value: 42 }]])
    const edges = [{ source: "node1", target: "node2" }]

    const result = getNodeInputsByHandle("node2", edges, context)

    expect(result).toEqual({
      _default: [{ value: 42 }],
    })
  })

  it("groups multiple inputs with different targetHandle ids", () => {
    const context = new Map([
      ["nodeA", { data: "primary" }],
      ["nodeB", { data: "secondary" }],
    ])
    const edges = [
      { source: "nodeA", target: "nodeC", targetHandle: "primary" },
      { source: "nodeB", target: "nodeC", targetHandle: "secondary" },
    ]

    const result = getNodeInputsByHandle("nodeC", edges, context)

    expect(result).toEqual({
      primary: [{ data: "primary" }],
      secondary: [{ data: "secondary" }],
    })
  })

  it("handles mixed edges: some with handles, some without", () => {
    const context = new Map([
      ["node1", "value1"],
      ["node2", "value2"],
      ["node3", "value3"],
    ])
    const edges = [
      { source: "node1", target: "nodeX" }, // no handle
      { source: "node2", target: "nodeX", targetHandle: "special" },
      { source: "node3", target: "nodeX" }, // no handle
    ]

    const result = getNodeInputsByHandle("nodeX", edges, context)

    expect(result).toEqual({
      _default: ["value1", "value3"],
      special: ["value2"],
    })
  })

  it("returns empty object when node has no incoming edges", () => {
    const context = new Map([["node1", { x: 1 }]])
    const edges: any[] = []

    const result = getNodeInputsByHandle("node2", edges, context)

    expect(result).toEqual({})
  })

  it("returns empty object when target node not found in edges", () => {
    const context = new Map([["node1", { x: 1 }]])
    const edges = [{ source: "node1", target: "node2" }]

    const result = getNodeInputsByHandle("node999", edges, context)

    expect(result).toEqual({})
  })

  it("skips edges where source node output is undefined in context", () => {
    const context = new Map([["node1", { value: 10 }]])
    const edges = [
      { source: "node1", target: "nodeZ" },
      { source: "node2", target: "nodeZ" }, // node2 not in context
    ]

    const result = getNodeInputsByHandle("nodeZ", edges, context)

    expect(result).toEqual({
      _default: [{ value: 10 }],
    })
  })

  it("handles multiple edges to the same handle", () => {
    const context = new Map([
      ["nodeA", "A"],
      ["nodeB", "B"],
      ["nodeC", "C"],
    ])
    const edges = [
      { source: "nodeA", target: "nodeTarget", targetHandle: "main" },
      { source: "nodeB", target: "nodeTarget", targetHandle: "main" },
      { source: "nodeC", target: "nodeTarget", targetHandle: "aux" },
    ]

    const result = getNodeInputsByHandle("nodeTarget", edges, context)

    expect(result).toEqual({
      main: ["A", "B"],
      aux: ["C"],
    })
  })
})

