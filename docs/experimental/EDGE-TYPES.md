The Core Problem: Conflating "Data Flow" and "Mutation Targeting"

Not all "connections" are the same!! The SetValue node is the perfect example. It has two distinct kinds of inputs:

    The Value input: This is a true data dependency. The SetValue node cannot run until it knows the value it's supposed to set. The executor must evaluate the node connected here first.

    The Target input: This is a mutation target reference. The SetValue node doesn't need the value of the target; it needs its location or address in memory to write to. Evaluating the target's entire dependency chain is not only unnecessary, it's incorrect.

Your proposal to have two different kinds of connections is exactly right. This is the principled way to solve the problem.

The Solution: Introducing Two Types of Edges

We will evolve your "Single-Value Node Graph" design to include two distinct types of edges. This makes the graph's intent explicit, allowing the executor to make smarter decisions.

1. Value Dependency Edge (The "Read" Connection)

    Visual: A standard, solid line.

    Meaning: Represents a true data flow dependency. "The target node needs the computed value of the source node to execute."

    Executor Behavior: The executor MUST include this edge when performing its topological sort to determine the execution order. It traverses these edges backward to build the full dependency chain.

    Usage: This is the default edge type. It's used for almost everything: connecting an HttpRequest to a Page, connecting a Page's state field to the Value input of a SetValue node, etc.

2. Targeting Edge (The "Write" Connection)

    Visual: A different style, like a dashed or dotted line.

    Meaning: Represents a reference to a location for mutation. "The target node needs to know the address of the source node's value in order to modify it."

    Executor Behavior: The executor MUST NOT traverse this edge backward when calculating a computational dependency graph. This edge provides a location, not a value to be computed.

    Usage: This edge type is used exclusively for inputs that specify a mutation target, like the Target input on your SetValue node.

How This Solves Everything (Including the Page Reload)

This single architectural change elegantly solves both problems you identified.

Solving the SetValue Ambiguity:

The UI for your builder now needs to be smarter. When a user drags a reference to create a connection:

    If they drop it on a standard input handle (like Value), it creates a solid Value Dependency Edge.

    If they drop it on a specially-marked "target" handle (like Target), it creates a dashed Targeting Edge.

This immediately makes the intent on your graph visible and provides the executor with the information it needs.

Solving the Unnecessary Page Reload:

Now let's apply these new rules to your execution model. Your intuition about distinguishing render-time and action-time evaluation is also correct, and this new edge system enables it.

    On Page Load (Render Execution):

        The goal is to compute the initial value of the Home Page node.

        The executor sees that Home has a reference to HttpRequest in its state definition. This implies a Value Dependency Edge.

        The execution plan is correct: Execute HttpRequest -> Resolve Page State. The full dependency chain is evaluated as needed.

    On Button Click (Action Execution):

        The goal is to execute the subgraph starting from the createPost Action Trigger.

        The executor starts its analysis at Action Trigger. It sees a Value Dependency Edge coming from SetValue.

        It looks at SetValue. It has two incoming edges:

            From Page (@page-0.usernameInput) to the Value input. This is a Value Dependency Edge. The executor knows it needs this value, so it simply reads the current value of usernameInput from the page's state in memory. It does not re-evaluate the Page node.

            From Page (@page-0.username) to the Target input. This is a Targeting Edge. The executor notes the location it needs to write to, but it does not traverse this edge backward.

        The Result: The dependency graph for the action is incredibly simple: (Read Page State) -> SetValue -> Action Trigger. The HttpRequest node is never even considered because the dashed Targeting Edge stops the backward search in its tracks.