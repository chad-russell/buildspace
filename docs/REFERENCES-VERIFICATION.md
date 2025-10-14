# References-First Authoring Verification

## Summary
All JSON-accepting nodes in the codebase properly follow the references-first pattern where JsonComposer creates edges via the `ensureEdge` callback when references are created.

## Nodes Using JsonComposer

### 1. DataNode (`components/dataflow/nodes/DataNode.tsx`)
- **Usage**: Editable JSON data input
- **ensureEdge callback**: ✅ YES
```tsx
<JsonComposer
  value={data.jsonData ?? {}}
  onChange={(next) => updateNodeData(id, { jsonData: next })}
  ownerNodeId={id}
  onCreateReference={(src, dst) => ensureEdge(src, dst)}
/>
```

### 2. PageNode (`components/dataflow/nodes/PageNode.tsx`)
- **Usage**: Editable page state schema
- **ensureEdge callback**: ✅ YES
```tsx
<JsonComposer
  value={pageStateObject}
  onChange={(next) => { /* ... */ }}
  ownerNodeId={id}
  onCreateReference={(src, dst) => ensureEdge(src, dst)}
/>
```

### 3. SetValueNode (`components/dataflow/nodes/SetValueNode.tsx`)
- **Usage**: Editable value expression (literal or reference)
- **ensureEdge callback**: ✅ YES
```tsx
<JsonComposer
  value={data.value ?? null}
  onChange={(next) => updateNodeData(id, { value: next })}
  ownerNodeId={id}
  onCreateReference={(src, dst) => ensureEdge(src, dst)}
/>
```

### 4. HttpRequestPreview (`components/dataflow/nodes/HttpRequestPreview.tsx`)
- **Usage**: Read-only display of HTTP response preview
- **ensureEdge callback**: N/A (read-only, no editing)
```tsx
<JsonComposer
  value={nodeData.previewData}
  readOnly={true}
  ownerNodeId={nodeId}
/>
```

### 5. InspectNode (`components/dataflow/nodes/InspectNode.tsx`)
- **Usage**: Read-only display of runtime preview data
- **ensureEdge callback**: N/A (read-only, no editing)
```tsx
<JsonComposer
  value={nodeState.preview}
  readOnly
  ownerNodeId={id}
/>
```

## Conclusion
✅ All editable JSON-accepting nodes properly use the `ensureEdge` callback.
✅ Read-only JsonComposer instances (HttpRequestPreview, InspectNode) correctly omit the callback.
✅ The references-first pattern is consistently implemented across the codebase.

## Pattern Requirements
When adding new nodes that accept JSON input:
1. Import `useDataFlowStore` and get `ensureEdge` from the store
2. Pass `ownerNodeId={id}` to JsonComposer
3. Add `onCreateReference={(src, dst) => ensureEdge(src, dst)}`
4. This ensures that creating a $ref automatically creates a plain edge for dependency tracking

