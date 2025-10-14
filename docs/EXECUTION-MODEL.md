# Execution Model: Roots and Boundaries

## Overview

BuildSpace uses a principled execution model based on **Execution Roots** and **Dependency Boundaries**. This model ensures efficient, predictable computation by preventing unnecessary re-execution of unrelated parts of the graph.

## Core Concepts

### Execution Roots

Execution Roots are the starting points for any computation. They define distinct **Execution Contexts**:

1. **Page Node** (Root for "Page Load" Context)
   - Purpose: Compute the data needed for initial page render
   - Triggers: When a user navigates to a page
   - Computes: All data dependencies needed for the page (HTTP requests, transformations, etc.)

2. **ActionTrigger Node** (Root for "Action" Context)
   - Purpose: Perform mutations or side-effects in response to user interactions
   - Triggers: When a user clicks a button, submits a form, etc.
   - Computes: Only the nodes directly involved in the action logic

### The Boundary Rule

**Core Principle**: When building an execution plan for a given Root, the dependency trace stops when it hits a node that belongs to a different Execution Context.

**Implementation**: 
- When tracing dependencies backward from an ActionTrigger
- If we encounter a Page node (a different execution root)
- The trace STOPS at that Page node
- The executor reads the Page's current value from runtime context
- The executor does NOT traverse the Page node's dependencies

**Why This Matters**: 
- Page state already exists in memory with current runtime values
- No need to re-fetch HTTP requests or re-compute data transformations
- Actions execute quickly, operating only on the nodes they actually need

## Execution Flows

### Flow 1: Page Load (Home Page Example)

```
Trigger: User navigates to /home
Root: Page node "Home"

Dependency Trace:
  Page → HttpRequest → Data nodes

Execution Plan:
  1. Execute Data nodes
  2. Execute HttpRequest (uses Data node outputs)
  3. Execute Page node (computes initial state)

Result: Page renders with fetched data
Context State: Page node value cached in memory
```

### Flow 2: Action Execution (Button Click Example)

```
Trigger: User clicks "createPost" button
Root: ActionTrigger node "createPost"

Dependency Trace:
  ActionTrigger → SetValue → Page (BOUNDARY HIT - STOP)

Execution Plan:
  1. Read Page state from runtime context (cached value)
  2. Execute SetValue (reads from Page state, mutates Page state)
  3. Execute ActionTrigger

Result: Page state updated, UI re-renders
NOT Executed: HttpRequest, Data nodes (beyond boundary)
```

### Flow 3: Multiple Actions

```
Each action has its own ActionTrigger root
Each action's trace stops at the Page boundary
Each action operates independently and efficiently
```

## Edge Types (Future Enhancement)

While not yet implemented in the data model, the execution model is designed to support two edge types:

### 1. Value Dependency Edge (Solid Line)
- **Meaning**: "Target node needs the computed value of source node"
- **Executor Behavior**: Traverses backward during dependency trace
- **Usage**: Default for data flow (HttpRequest → Page, Page.field → SetValue.value)

### 2. Targeting Edge (Dashed Line - Future)
- **Meaning**: "Target node needs the location/address of source for mutation"
- **Executor Behavior**: Does NOT traverse backward during dependency trace
- **Usage**: Mutation targets (Page.field → SetValue.target)
- **Note**: Currently all edges are treated as Value Dependency Edges

## Benefits

1. **Performance**: Actions don't re-fetch data unnecessarily
2. **Predictability**: Clear separation between page initialization and action logic
3. **Scalability**: Complex graphs remain efficient as complexity grows
4. **Maintainability**: Explicit execution contexts make debugging easier

## Implementation Details

### Current State Injection

When an action executes:
1. Client sends current page state in request body
2. Action executor pre-populates Page node in context with this state
3. Page node is marked as already-executed (skip re-execution)
4. Boundary rule prevents traversing beyond Page node
5. Action logic operates on current runtime state

### Code Location

- Action executor: `lib/executor/action-executor.ts`
- Boundary logic: `getUpstreamNodes()` function
- State injection: `executeActionFlow()` function

## Future Enhancements

1. **Targeting Edge Implementation**
   - Add `edgeType` field to `DataFlowEdge` type
   - Modify dependency trace to skip targeting edges
   - UI affordances for creating targeting vs value edges

2. **Multiple Page Nodes**
   - Support for multi-page applications in one graph
   - Enhanced context tracking to handle multiple page roots

3. **Additional Root Types**
   - Scheduled jobs (cron-like execution roots)
   - Webhook handlers (external trigger roots)
   - Background tasks (async execution roots)

## Design Philosophy

This execution model aligns with the Single-Value Node Graph design (see `GRAPH-DESIGN.md`):

- **Simplicity**: One value per node, clear execution boundaries
- **Explicitness**: Execution contexts are visible in the graph structure
- **Composability**: Roots can be composed without interference
- **Evolvability**: Model supports future enhancements without breaking changes

The combination of single-value nodes and execution root boundaries creates a powerful, intuitive system for building interactive applications.

