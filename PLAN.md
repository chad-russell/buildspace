Revised Project Plan & Specification: BuildSpace
1. High-Level Vision
BuildSpace is a visual computation and application development environment built with Next.js. It empowers users, particularly those with limited technical expertise, to create data-driven web applications without writing code.
The core differentiator from tools like n8n is its focus on powering live, interactive front-end user interfaces. The platform will be "batteries-included," providing built-in solutions for common application needs like authentication and state management.
2. Core Philosophy & Design Principles
Visual Clarity Over Magic: Every piece of data and logic must be visible and traceable on a canvas. The user should always be able to answer "Where did this data come from?". Each node type will have its own custom React component for a rich, specific user experience.
Macro-to-Micro Abstraction: The platform will separate high-level application architecture (data flows, page relationships) from low-level page design (UI layout, component styling). This allows users to focus on the task at hand without cognitive or visual overload.
Prioritize the User's Mental Model: The architecture must favor intuitive, direct-manipulation workflows (e.g., drawing a line from data to a UI element) over abstract concepts like prop-drilling.
Highly Interactive & Introspective Environment: Every node and connection should be inspectable. Users must be able to click on any part of a graph and instantly see the data at that point, enabling a tight "build-and-debug" loop.
Consistency is Key: All data sources (APIs, databases, session state) are treated as nodes on a canvas, creating a consistent and learnable interface.
"Batteries Included": The platform will provide elegant, pre-built solutions for common application requirements, most notably authentication.
3. High-Level Architecture: Dynamic Interpretation Model
BuildSpace will operate on a Dynamic Interpretation Model. User-built applications are rendered and served live by the core BuildSpace platform.
Frontend: A Next.js application serves two distinct but connected interfaces: the Application Architecture Canvas and the Page Design Canvas. It also serves the published user applications (/app/{appId}/{page-slug}).
Backend: A robust set of Next.js API Routes provide the core services, with the DataFlow Executor API at its center.
DataFlow Execution: All data logic is executed securely on the server-side as a classic Backend for Frontend (BFF). When a user visits a page, the client requests data from the Executor, which runs the necessary data graph and returns a final JSON payload for rendering.
4. The Two-Canvas Architectural Model
This is the heart of the BuildSpace platform, replacing the previous "one-flow-per-page" model.
4.1. The Application Architecture Canvas (The "Macro" View)
This is the single source of truth for an application's entire data logic and structure. It is a unified, pannable canvas where users:
Define all data-fetching and data-transformation nodes (HTTP Request, Select Fields, etc.).
Define special Page nodes that represent the individual pages of their web application.
Visually connect data nodes to Page nodes to establish dependencies.
4.2. The Page Node & The Data Contract
A Page node is not just a placeholder; it's a functional node that defines the data contract for a specific page.
Named Inputs: A user can add "Named Inputs" to any Page node (e.g., currentUser, productList). These inputs function like props or arguments.
Wiring the Contract: The user then draws wires from their data nodes on the canvas to these specific named inputs. This act explicitly defines what data that page requires to render.
4.3. The Page Design Canvas (The "Micro" View)
This is a separate, focused editor that a user enters by, for example, double-clicking a Page node. This canvas is dedicated only to UI layout and design for that single page.
Focused Environment: This view is free from the clutter of the main application graph.
Marked Input Nodes: The Named Inputs defined in the previous step appear here as special, read-only data source nodes on a sidebar. They are local references to the data being piped into the page from the main graph.
4.4. Direct Visual Binding
This is the new, highly intuitive method for connecting data to UI. Within the Page Design Canvas, a user can:
Drag UI components (buttons, text fields, lists) from a library onto the layout.
Draw a connection directly from a "Marked Input" node (e.g., currentUser) to a UI component or one of its specific properties to bind the data.
4.5. Interaction Model: Reactive Refetching
The interaction model remains robust. User events (e.g., a button click) can trigger Action Flows on the main Application Architecture Canvas. An Action Flow can invalidate a data node, causing the platform to re-run that node and any downstream dependencies, automatically updating any pages that consume that data.
5. Key Systems & Features
5.1. Drizzle Schema & Database
A PostgreSQL database managed by Drizzle. Key models will include: User, Project, and ApplicationGraph.
ApplicationGraph: Stores the entire graph for one application, including all data nodes, Page nodes, and the connections between them in a JSON field.
Page: The Page model will be implicitly defined within the ApplicationGraph JSON, storing its layout information (from Craft.js) and its list of namedInputs.
5.2. The Server-Side DataFlow Executor
The workhorse API, which will now:
Accept a page identifier (e.g., a slug or ID).
Load the ApplicationGraph.
Find the corresponding Page node within the graph.
Trace dependencies backwards from the page's namedInputs to determine the required sub-graph of data nodes.
Perform a topological sort on only the required sub-graph and execute it.
Return the final, structured JSON object to the client, matching the namedInputs contract.
5.3. The Application Architecture Canvas
The primary editor, built with React Flow. This is where users manage the high-level application structure and all data logic.
5.4. The Page Design Canvas
A secondary, focused editor, likely built with a library like Craft.js. This is where users design layouts and perform direct visual data binding using the "Marked Input" nodes.
6. Initial Node Type Specification
Every node will have a custom, intuitive UI.
6.1. Structural Nodes
Page: The most important structural node. Defines a webpage, its route/slug, and its namedInputs which form its data contract.
6.2. Data Fetching
HTTP Request: A rich UI for making API calls.
Read Session: Outputs the current Session State object for authenticated users.
6.3. Data Transformation & Logic
Select Fields: Visually pick or rename keys from an input object.
Merge: Combines two or more objects.
Conditional (If/Else): Routes data down different paths based on a condition.
Run JavaScript: An "escape hatch" for advanced logic.
6.4. State & Actions
Update Session: A node that takes a JSON object as input and merges it into the session.
Invalidate Node & Refetch: A terminal node for an Action Flow that triggers a data refresh on the main graph.
7. Technical Stack & Implementation Details
Framework: Next.js 14+ with the App Router.
Language: TypeScript.
Styling: Tailwind CSS.
UI Components: shadcn/ui.
Database: PostgreSQL.
ORM: Drizzle.
Architecture Canvas Library: React Flow.
Page Design Canvas Library: Craft.js.
Builder State Management: Zustand or Jotai.
Authentication: NextAuth.js.
