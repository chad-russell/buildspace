Project Plan & Specification: BuildSpace
1. High-Level Vision
BuildSpace is a visual computation and application development environment built with Next.js. It empowers users, particularly those with limited technical expertise, to create data-driven web applications without writing code.
The core differentiator from tools like n8n or Zapier is its focus on powering live, interactive front-end user interfaces, rather than durable, background workflows. The platform will be "batteries-included," providing built-in solutions for common application needs like authentication and state management.
2. Core Philosophy & Design Principles
These principles should guide all architectural and implementation decisions.
Visual Clarity Over Magic: Every piece of data and logic should be visible and traceable on a canvas. Avoid "magic" where data appears in the application without an explicit visual source. The user should always be able to answer "Where did this data come from?".
Each DataFlow node type should have its own custom React component for rendering it specifically.`
Prioritize the User's Mental Model: For no-code users, concepts like prop-drilling and complex state management are significant barriers. The architecture must favor a simpler, more intuitive mental model, even if it differs from traditional software engineering "best practices."
Highly Interactive & Introspective Environment: Every node, connection, and data object on the canvas should be interactive. Users must be able to click on any part of a DataFlow and instantly see the data at that point, enabling a tight "build-and-debug" loop.
Consistency is Key: Data sources, whether they are an external API, a database, or the application's session, should be treated as similar node-based concepts on the canvas to create a consistent and learnable interface.
"Batteries Included": The platform should provide elegant, pre-built solutions for common and complex application requirements, most notably authentication and user session management.
3. High-Level Architecture: Dynamic Interpretation Model
BuildSpace will operate on a Dynamic Interpretation Model. The applications built by users are not compiled into standalone static sites. Instead, they are rendered and served live by the core BuildSpace platform.
Frontend: A Next.js application serves the builder interface (/build) and the published user applications (/app/{appId}/{page}).
Backend: A robust set of Next.js API Routes provide the core services. The most critical of these is the DataFlow Executor API.
DataFlow Execution: All DataFlows are executed securely on the server-side. The client-side application makes a request to the Executor API, which then runs the graph, fetches data from external sources, performs transformations, and returns a final JSON payload to the client for rendering. This is a classic Backend for Frontend (BFF) pattern.
4. Detailed Data & Execution Model
This is the heart of the BuildSpace platform.
4.1. The Page Data Model
One DataFlow Per Page: To maximize simplicity for the end-user, each page will be powered by a single, dedicated DataFlow. This flow is responsible for fetching and preparing all the data required for that page to render.
The "Page Data Object": The final output of a page's DataFlow is a single, structured JSON object. This Page Data Object represents the complete state of the page at a given time and is the single source of truth for all components on that page.
4.2. Component Data Binding
Explicit Visual Binding: Components on a page do not have their own individual DataFlows. Instead, their props are bound to data within the Page Data Object.
The Binding Process: In the page editor, a user will select a component (e.g., a "User Card"). In the properties panel for that component, each prop (e.g., userName, avatarUrl) will have a "bind data" option. Clicking this will open a UI that allows the user to visually navigate the schema of the Page Data Object and select the correct path (e.g., data.user.name, data.user.profile.imageUrl).
4.3. The Interaction Model: Reactive Refetching
On Page Load Flow: The primary DataFlow for a page is triggered when the page is first loaded.
Action Flows: User interactions, such as a button click, form submission, or item selection, can trigger separate, smaller Action Flows.
Node Invalidation & Refetching: An Action Flow's primary purpose is often to change data on the server (e.g., POSTing a new comment). Upon successful completion, the Action Flow will invalidate one or more nodes in the main On Page Load flow (e.g., the "Fetch Comments" node). This invalidation signals to the system that the node's data is stale. The platform will then automatically re-run that node and any downstream nodes that depend on its output, efficiently fetching the fresh data and updating the UI. This model is simple, robust, and ensures the server remains the single source of truth.
4.4. Cross-Page State: The Session State
Centralized Session State: A global, cross-page state object, the Session State, will be available to manage data that needs to persist across the application (e.g., the currently authenticated user).
Node-Based Access: To maintain visual clarity and consistency, this state is not a magical global variable. It is accessed via dedicated nodes within a DataFlow:
Read Session Node: An input-style node that, when placed on the canvas, outputs the current Session State object for use in the rest of the flow. Its UI will visually display the contents of the session for easy debugging.
Update Session Node: An output-style node that takes a JSON object as input and merges it into the current Session State, persisting it for use on other pages.
5. Key Systems & Features
5.1. Prisma Schema & Database
A PostgreSQL database managed by Prisma will store all user-created artifacts. Key models will include: User, Project, Page, Component, and DataFlow. The DataFlow model must store its graph structure (nodes and edges, including positions) in a JSON field.
5.2. The Server-Side DataFlow Executor
This will be a Next.js API Route that is the workhorse of the platform. It will:
Accept a flowId and input parameters.
Fetch the DataFlow definition from the database.
Perform a topological sort to determine the correct execution order of nodes.
Iterate through the nodes, executing their specific logic (e.g., making fetch calls, transforming data).
Manage a context object to pass outputs from one node to the inputs of another.
Handle secret management, securely injecting API keys and other credentials into nodes that require them.
Return the final output of the flow.
5.3. The Visual DataFlow Editor
This is the primary interface where users build their logic.
Technology: Built using React Flow.
Features:
A pannable, zoomable canvas.
A sidebar containing all available node types that can be dragged onto the canvas.
A context-aware properties panel that displays a custom React UI for configuring the currently selected node.
An interactive "Test Run" feature that allows users to execute the flow and see the JSON input and output for every single node in the graph.
5.4. The Visual Page Editor
This is where users design the UI of their application pages.
A drag-and-drop interface for placing components on a page canvas.
A component library sidebar.
A properties panel for selected components to configure their appearance and bind their props to the Page Data Object.
Use Craft.js for this
6. Initial Node Type Specification
Every node type must have a custom, intuitive UI in the properties panel.
6.1. Triggers / Inputs
On Page Load: The entry point for the main page DataFlow.
Read Session: Outputs the current Session State object.
Input: Defines a static value (string, number, JSON) for use in the flow.
6.2. Data Fetching
HTTP Request: A rich UI for setting URL, method, headers, query parameters, and body. Supports referencing secrets (e.g., {{secrets.STRIPE_API_KEY}}).
Database Query: (Future) A visual query builder for a user's connected database.
6.3. Data Transformation & Logic
Select Fields: A UI with checkboxes or a text area to visually pick or rename keys from an input object.
Merge: Visually combines two or more objects.
Conditional (If/Else): Routes data down one of two paths (true or false) based on a configurable condition.
Loop / Map: Iterates over an array and runs a sub-graph of nodes for each item.
Run JavaScript: An "escape hatch" node with a small code editor for advanced transformations.
6.4. Outputs & State
Return to Page: The terminal node for an On Page Load flow. Its input becomes the Page Data Object.
Update Session: The terminal node for an Action Flow that needs to persist data to the session.
Invalidate Node & Refetch: The terminal node for an Action Flow that triggers a data refresh. Its UI allows the user to pick which node(s) in the main flow should be invalidated.
7. Technical Stack & Implementation Details
Framework: Next.js 14+ with the App Router.
Language: TypeScript.
Styling: Tailwind CSS.
UI Components: shadcn/ui. All UI, from buttons to complex panels, should be built using this library for a consistent and modern look and feel.
Database: PostgreSQL.
ORM: Prisma.
Visual Canvas Library: React Flow.
Client-Side State Management (for the builder): Zustand or Jotai for managing the state of the builder UI itself.
Authentication: NextAuth.js.
