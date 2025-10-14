Graph Alignment Plan (Single‑Value Node Model)
See docs/GRAPH-DESIGN.md for the full design. This section lists concrete steps to align the current app with that design.

Short‑Term (1–2 days)
1) PageNode: single unlabeled output
   - Remove dual “Data/State” source handles in `components/dataflow/nodes/PageNode.tsx`.
   - Use default BaseNode handles (unlabeled left target, right source).
   - Keep the “Page State” editor section as is.

2) Labeling/Copy updates
   - Avoid the words “Data” vs “State” on ports. Use “Output” only if needed.
   - Update any UI hints/tooltips to describe “full value output” semantics.

3) Doc surfacing
   - Link to `docs/GRAPH-DESIGN.md` from the README and internal help.

4) Ensure edges are handle‑agnostic at runtime (already true)
   - Confirm executor ignores handle ids for inputs (it does), keeping single‑value semantics.

5) SetValue guardrails (already in place)
   - Disallow setting an entire node root; enforce non‑empty path (already implemented).

Medium‑Term (1–2 weeks)
1) References-first authoring
   - In all node UIs that accept JSON, ensure `JsonComposer` drag‑to‑reference UX is consistent, and that creating a reference also ensures a plain edge from source → consumer for dependency clarity.

2) Executor: inputs API prepped for future ports
   - Add an optional helper `getNodeInputsByHandle(...)` in the executor that groups inputs by `targetHandle`. Keep current `getNodeInputs(...)` as the default. Do not switch nodes yet; just stage the utility and unit tests.

3) Node docs/specs
   - Document each node’s input behavior (e.g., Select consumes first input; others ignore inputs).
   - Document which fields accept references and how they resolve.

4) Action flows & Page synchronization
   - Keep current behavior where action result prefers the Page node value if present.
   - Add a brief in‑product explanation near Action Trigger nodes.

5) Visual affordances
   - Make default unlabeled handles slightly more visible on hover; keep labels off by default.

6) Optional: Introduce passive “Output” label style
   - Non‑interactive caption next to the right handle to reduce ambiguity for new users, gated behind a feature flag.

Future (behind a flag)
1) Labeled multi‑port nodes
   - Enable per‑node handle definitions with ids. When present, edges carry handle ids; the executor pathway uses `getNodeInputsByHandle`.
   - Start with advanced nodes only; keep default single‑port behavior elsewhere.

2) Caching & memoization
   - With purity-by-default, add caching for deterministic nodes keyed by config + upstream hashes.

3) Validation & tracing
   - Surface a trace view that shows, for any node, its upstream edges, resolved references, and final output value.
