# Execution Model: ActionTrigger-Based Workflows

## Overview

BuildSpace uses a clean, intuitive execution model based on **ActionTrigger nodes** as workflow entry points. This model follows the n8n/Zapier paradigm where workflows are triggered by events and flow downstream through connected nodes.

## Core Concepts

### ActionTrigger Nodes: The Only Workflow Roots

**ActionTrigger nodes** are the sole entry points for workflow execution. Each ActionTrigger:
- Has a unique `actionName` identifier
- Has NO input connections (they are roots, not targets)
- Has ONE output connection (source handle on the right)
- Can be triggered by:
  - Page load (via Page node's `onLoadTriggerId` setting)
  - Button clicks in the UI
  - Form submissions
  - Any other user interaction

### Push-Based Execution

**Core Principle**: Workflows execute by pushing forward from ActionTrigger nodes, following edges in the direction of data flow.

**How It Works**:
1. An ActionTrigger is invoked (by page load, button click, etc.)
2. The executor finds all nodes downstream from the trigger
3. Nodes are sorted in topological order
4. Each node executes in sequence, with access to outputs from upstream nodes
5. The workflow completes when all downstream nodes have executed

### Page Nodes and State

**Page nodes** in the new model:
- Have NO connection handles (they don't participate in the execution graph)
- Define a `pageState` object with all page state fields
- Specify an `onLoadTriggerId` - which ActionTrigger to run when the page loads
- Page State is ALWAYS available in the execution context (via `$ref` references)

**Page State Flow**:
1. Page loads → Page node specifies which ActionTrigger to run
2. Initial Page State is computed from default values
3. ActionTrigger workflow executes, may include SetValue nodes
4. SetValue nodes can modify Page State during execution
5. Updated Page State is returned to the runtime

### Workflow Types

#### 1. Page Load Workflow

```
Trigger: User navigates to /home
Entry Point: Page node specifies onLoadTriggerId

Flow:
  Page specifies ActionTrigger "initializePage"
  → ActionTrigger starts workflow
  → HttpRequest (fetch user data)
  → Data (transform response)
  → SetValue (update Page State with user data)
  
Result: Page renders with fetched and processed data
```

#### 2. Action Workflow (Button Click Example)

```
Trigger: User clicks "createPost" button
Entry Point: Button component invokes ActionTrigger "createPost"

Flow:
  ActionTrigger "createPost"
  → Data (build request payload from Page State)
  → HttpRequest (POST to API)
  → SetValue (update Page State with new post)
  
Result: Page State updated, UI re-renders with new data
```

#### 3. Multiple Independent Actions

```
Each button/interaction can trigger its own ActionTrigger:
- "loadData" → fetches initial data
- "saveChanges" → posts updates to server
- "deleteItem" → removes item and updates state

Each action is independent and self-contained.
```

## Execution Details

### Forward Traversal Algorithm

When an ActionTrigger is invoked:

1. **Find Downstream Nodes**: Starting from the ActionTrigger, perform BFS forward following all outgoing edges
2. **Build Subgraph**: Include only the trigger and its downstream nodes in the execution set
3. **Topological Sort**: Sort nodes so that dependencies execute before dependents
4. **Execute Sequentially**: Run each node, storing outputs in the execution context
5. **Return Result**: Updated Page State (if applicable) is returned to the runtime

### Context and State Management

**Execution Context**: A Map<nodeId, output> that stores all node outputs during execution

**Page State Injection**:
- On page load: Default Page State is computed and injected into context
- On action: Current runtime Page State is injected into context from the client
- SetValue nodes modify Page State in-place within the context
- Final Page State is extracted and returned after workflow completes

### Reference Resolution

Nodes can reference outputs from other nodes using JSON path references:
```typescript
{ $ref: [{ id: "node-123" }, "data", "userId"] }
```

References are resolved during node execution by:
1. Looking up the source node ID in the execution context
2. Extracting the value at the specified path
3. Using that value in the current node's computation

## Benefits of This Model

1. **Intuitive**: Matches mental model from popular workflow tools (n8n, Zapier)
2. **Explicit**: Workflows start from clear, visible entry points (ActionTriggers)
3. **Composable**: Multiple independent workflows can coexist without interference
4. **Efficient**: Only nodes in the triggered workflow execute
5. **Predictable**: Data flows in one direction (forward from trigger)
6. **Flexible**: Fan-out patterns supported via multiple downstream connections

## Implementation Notes

### No Backward Dependencies

Unlike the old pull-based model, there are no "execution boundaries" or "root nodes" to stop traversal. Execution simply flows forward from ActionTriggers through their downstream connections.

### Page State Always Available

Even though Page nodes don't have connections, Page State is always accessible:
- Pre-populated in execution context before workflow starts
- Nodes can reference it via `$ref` expressions
- SetValue nodes can modify it during execution
- Updated state is returned after execution completes

### Multiple Workflows, One Page

A single Page can have many ActionTriggers:
- One for page load initialization
- Others for various user interactions (buttons, forms, etc.)
- Each runs independently when triggered
- All share access to the same Page State

## Future Enhancements

Potential additions to the model:

1. **Scheduled Triggers**: ActionTriggers that run on a schedule (cron-like)
2. **Webhook Triggers**: ActionTriggers invoked by external HTTP requests
3. **Fan-Out Nodes**: Explicit nodes for parallel execution branches
4. **Conditional Nodes**: Execute different paths based on conditions
5. **Loop Nodes**: Repeat execution over collections

The current model provides a solid foundation for these future capabilities without requiring architectural changes.
