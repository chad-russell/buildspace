Single‑Value Node Graph: Design Principles

Overview
This document defines the core dataflow semantics for the builder/runtime. It aligns the visual editor, mental model, and executor under one simple rule: each node produces exactly one JSON value, and edges carry that whole value between nodes.

Core Principles
1) One node → one output value
- Every node computes a single JSON value (object, array, string, number, boolean, null).
- Edges carry that entire value from a source node to a target node.
- Output ports are unlabeled by default. If a node needs multiple outputs in the future, we will add labeled ports explicitly, but the default remains single-output.

2) Edges express dependency, not field selection
- An edge means “target depends on the full value of source.”
- Fine‑grained (field‑level) selection happens inside nodes via path expressions/JSON references, not via separate output ports.

3) References select paths within values
- The UI uses JSON path references of the form { $ref: [{ id: <nodeId> }, ...path] }.
- References can appear inside any node’s config to point at a subpath of another node’s output.
- During execution, references are resolved by looking up the producing node’s value and selecting the specified path.

4) Pure by default; explicit side effects
- All nodes are pure functions of their inputs and references, except explicit mutation nodes.
- The SetValue node is the mutation primitive: SetValue(targetPathRef, valueExpr) produces a value and mutates the target node’s value at the given path in the runtime context.
- Mutations are localized and visible in the graph, ensuring traceability and testability.

5) Page node defines state value
- A Page node’s configuration defines its initial state schema. Its output is the resolved page state value.
- Other nodes (including SetValue during actions) can read and write paths within this state via references.

6) Inputs are a multiset of upstream values
- A node may have zero or more incoming edges. The executor provides inputs as an ordered array of upstream node values (order is not semantically important; nodes are free to choose how to consume inputs).
- Specialized nodes (e.g., Select) document how they consume inputs (e.g., first input only).

7) Deterministic evaluation order
- The graph executes via topological sort over edges. Reference resolution is performed against the evaluated context.
- Cycles are disallowed at graph‑editing time.

8) UI/Runtime symmetry
- The editor shows a single unlabeled source and target handle on nodes by default, matching runtime semantics.
- Field‑level wiring is performed by dragging paths (via JsonComposer) to create references; the editor automatically creates a plain edge between the referenced node and the consumer to reflect the dependency.

Node Semantics
- DataNode: Produces its configured JSON after resolving embedded references.
- HttpRequestNode: Produces the parsed response value; configuration (URL, body, headers) may use references.
- SelectNode: Requires one input; projects/renames fields from the input value; outputs the result.
- PageNode: Produces the resolved page state value (from its schema/object), used both at render time and during action flows.
- SetValueNode (effectful): Mutates a path in another node’s value in the runtime context and returns the value written.
- ActionTriggerNode: Consumes upstream values during an action; the action flow’s final output is the updated Page node value when present.

Extensibility: Multi‑Port Future
If needed, we can extend the model to support labeled inputs/outputs without breaking existing graphs:
- Preserve the default single unlabeled source/target.
- When a node defines handles with ids, edges may specify targetHandle/sourceHandle; the executor groups inputs by handle id (inputsByHandle: Record<string, any[]>).
- Existing nodes that ignore handles continue to work unchanged.

Why this model
- Simple: one value per node keeps the mental model tight.
- Explicit: references make field‑level dependencies visible and auditable.
- Composable: nodes are pure by default, enabling caching and replay; SetValue centralizes mutations.
- Evolvable: handle ids can be introduced later for advanced nodes without rewriting the runtime.


