Single‑Value Node Graph: Design Principles

## Overview

This document defines the core dataflow semantics for the builder/runtime. It aligns the visual editor, mental model, and executor under one simple rule: each node produces exactly one JSON value, and edges carry that whole value between nodes.

## Core Principles

### 1) One node → one output value

- Every node computes a single JSON value (object, array, string, number, boolean, null).
- Edges carry that entire value from a source node to a target node.
- Output ports are unlabeled by default. If a node needs multiple outputs in the future, we will add labeled ports explicitly, but the default remains single-output.

### 2) Edges express dependency, not field selection

- An edge means "target depends on the full value of source."
- Fine‑grained (field‑level) selection happens inside nodes via path expressions/JSON references, not via separate output ports.

### 3) References select paths within values

- The UI uses JSON path references of the form `{ $ref: [{ id: <nodeId> }, ...path] }`.
- References can appear inside any node's config to point at a subpath of another node's output.
- During execution, references are resolved by looking up the producing node's value and selecting the specified path.

### 4) Pure by default; explicit side effects

- All nodes are pure functions of their inputs and references, except explicit mutation nodes.
- The SetValue node is the mutation primitive: `SetValue(targetPathRef, valueExpr)` produces a value and mutates the target node's value at the given path in the runtime context.
- Mutations are localized and visible in the graph, ensuring traceability and testability.

### 5) Page node defines state value

- A Page node's configuration defines its state schema. Its output is the resolved page state value.
- Other nodes (including SetValue during actions) can read and write paths within this state via references.
- **Important**: Page nodes are NOT part of the execution graph (they have no handles/connections).
- Page nodes specify which ActionTrigger to run on page load via `onLoadTriggerId`.

### 6) Inputs are a multiset of upstream values

- A node may have zero or more incoming edges. The executor provides inputs as an ordered array of upstream node values (order is not semantically important; nodes are free to choose how to consume inputs).
- Specialized nodes (e.g., ActionTrigger) document how they consume inputs.

### 7) Deterministic evaluation order

- The graph executes via topological sort over edges. Reference resolution is performed against the evaluated context.
- Cycles are disallowed at graph‑editing time.

### 8) UI/Runtime symmetry

- The editor shows a single unlabeled source and target handle on nodes by default, matching runtime semantics.
- Field‑level wiring is performed by dragging paths (via JsonComposer) to create references; the editor automatically creates a plain edge between the referenced node and the consumer to reflect the dependency.

## Execution Model: ActionTrigger-Based Workflows

### 9) ActionTrigger nodes are the only workflow roots

- **ActionTrigger nodes** are the exclusive entry points for workflow execution.
- They have NO target handle (input) - only a source handle (output).
- Each ActionTrigger has a unique `actionName` identifier.
- Workflows execute by pushing forward from ActionTriggers to all downstream nodes.

### 10) Push-based execution

- When an ActionTrigger is invoked (by page load, button click, etc.):
  1. Executor finds all nodes downstream from the trigger (BFS forward)
  2. Filters edges to those in the execution subgraph
  3. Sorts nodes topologically
  4. Executes nodes in order
  5. Returns results (typically updated Page State)

### 11) Page State is always available

- Page State is pre-populated in the execution context before workflows run
- Any node can reference Page State fields via `$ref` expressions
- SetValue nodes can modify Page State during workflow execution
- Updated Page State is returned to the runtime after execution completes

### 12) No execution boundaries

Unlike the old pull-based model:
- There are no "execution roots" that stop backward traversal
- There are no "boundary" concepts
- Execution simply flows forward from ActionTriggers through their downstream connections

See `EXECUTION-MODEL.md` for detailed documentation of ActionTrigger-based workflows.

## Node Semantics

- **DataNode**: Produces its configured JSON after resolving embedded references.
- **HttpRequestNode**: Produces the parsed response value; configuration (URL, body, headers) may use references.
- **PageNode**: Defines page state schema and specifies which ActionTrigger runs on page load. NOT part of execution graph (no handles).
- **ActionTriggerNode**: Workflow entry point. Has unique `actionName`. Source handle only (no target). All downstream nodes execute when triggered.
- **SetValueNode** (effectful): Mutates a path in another node's value in the runtime context and returns the value written.
- **InspectNode**: Visualizes input data for debugging.

## Workflow Patterns

### Page Load Pattern

```
Page node specifies onLoadTriggerId: "initPage"

ActionTrigger "initPage"
  → HttpRequest (fetch data)
  → Data (transform)
  → SetValue (update Page State)
```

### Button Click Pattern

```
Button calls action "saveForm"

ActionTrigger "saveForm"
  → Data (build payload from Page State)
  → HttpRequest (POST to server)
  → SetValue (update Page State with response)
```

### Multiple Independent Actions

```
ActionTrigger "loadData" → [workflow A]
ActionTrigger "saveData" → [workflow B]
ActionTrigger "deleteData" → [workflow C]

Each triggered independently, all share Page State.
```

### Fan-Out Pattern

```
ActionTrigger "initPage"
  ├→ HttpRequest A → SetValue
  ├→ HttpRequest B → SetValue
  └→ HttpRequest C → SetValue

Multiple parallel workflows from one trigger.
```

## Extensibility: Multi‑Port Future

If needed, we can extend the model to support labeled inputs/outputs without breaking existing graphs:

- Preserve the default single unlabeled source/target.
- When a node defines handles with ids, edges may specify `targetHandle`/`sourceHandle`; the executor groups inputs by handle id (`inputsByHandle: Record<string, any[]>`).
- Existing nodes that ignore handles continue to work unchanged.

## Why This Model

- **Simple**: One value per node keeps the mental model tight.
- **Explicit**: References make field‑level dependencies visible and auditable.
- **Intuitive**: ActionTrigger-based workflows match familiar tools (n8n, Zapier).
- **Composable**: Nodes are pure by default, enabling caching and replay; SetValue centralizes mutations.
- **Evolvable**: Handle ids and new node types can be introduced later without rewriting the runtime.
- **Predictable**: Data flows in one clear direction (forward from triggers).
