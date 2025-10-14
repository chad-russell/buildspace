Graph Alignment Plan (Single‑Value Node Model)
See docs/GRAPH-DESIGN.md for the full design. This section lists concrete steps to align the current app with that design.

Sprint 1 – Completed ✅
1) PageNode: single unlabeled output
   - ✅ Removed dual "Data/State" source handles in `components/dataflow/nodes/PageNode.tsx`.
   - ✅ Uses default BaseNode handles (unlabeled left target, right source).
   - ✅ "Page State" editor section remains unchanged.

2) Labeling/Copy updates
   - ✅ Avoided "Data" vs "State" terminology on ports.
   - ✅ Updated UI hints in DataNode and ActionTriggerNode to describe full value output semantics.

3) Doc surfacing
   - ✅ Linked to `docs/GRAPH-DESIGN.md` from README.

4) Visual affordances
   - ✅ BaseNode hover effects (scale + ring) for all handles.
   - ✅ Hover-only "Output" caption on default source handle.

5) Runtime verification
   - ✅ Confirmed executor ignores handle ids for inputs, keeping single‑value semantics.
   - ✅ SetValue guardrails enforce non‑empty path (already implemented).

Medium‑Term (In Progress)
1) References-first authoring
   - ✅ DataNode, PageNode, SetValueNode all use `JsonComposer` with `ensureEdge` callback.
   - Verified: all JSON-accepting nodes follow reference-first pattern.

2) Executor: inputs API prepped for future ports
   - Add `getNodeInputsByHandle(...)` helper that groups inputs by `targetHandle`.
   - Keep current `getNodeInputs(...)` as default; no nodes switched yet.
   - Add unit tests for the new utility.

3) Node executor documentation
   - Add JSDoc to each node executor describing input consumption pattern.
   - Document which executors ignore inputs vs consume them.

4) Action flows & Page synchronization
   - ✅ Current behavior: action result prefers Page node value when present.
   - ✅ ActionTriggerNode shows explanation of this behavior.

Future (behind a flag)
1) Labeled multi‑port nodes
   - Enable per‑node handle definitions with ids. When present, edges carry handle ids; the executor pathway uses `getNodeInputsByHandle`.
   - Start with advanced nodes only; keep default single‑port behavior elsewhere.

2) Caching & memoization
   - With purity-by-default, add caching for deterministic nodes keyed by config + upstream hashes.

3) Validation & tracing
   - Surface a trace view that shows, for any node, its upstream edges, resolved references, and final output value.
