# BuildSpace

A visual computation and application development environment built with Next.js. BuildSpace empowers users to create data-driven applications using a node-based visual interface.

## Features

- **Visual DataFlow Editor**: Build logic flows using a drag-and-drop node interface
- **4 Core Node Types**:
  - **Data**: Static JSON data input
  - **HTTP Request**: Make API calls
  - **Select**: Pick and transform JSON fields (like visual jq)
  - **Inspect**: Visualize and debug data
- **Server-Side Execution**: All DataFlows execute securely on the server
- **Auto-Save**: Changes are automatically saved to the database
- **Test Runner**: Execute and debug your flows in real-time

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL with Drizzle ORM
- **Visual Canvas**: React Flow
- **State Management**: Zustand

## Prerequisites

- Node.js 18+ or compatible runtime
- Docker and Docker Compose (for database)
- pnpm (recommended) or npm

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd bs2
pnpm install
```

### 2. Start PostgreSQL Database

Using Docker Compose (easiest option):

```bash
pnpm db:start
```

This will start a PostgreSQL container in the background.

**Alternative**: If you prefer to use your own PostgreSQL instance, update `.env.local` with your connection string.

### 3. Configure Database Connection

The Docker setup uses these default credentials:
- Database: `buildspace`
- User: `buildspace`
- Password: `buildspace`
- Port: `5432`

Your `.env.local` should have:

```env
DATABASE_URL="postgresql://buildspace:buildspace@localhost:5432/buildspace"
```

### 4. Initialize Database

Run migrations and seed the database:

```bash
pnpm db:init
```

This will:
- Run all database migrations
- Create a placeholder user for development

### 5. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### Creating a DataFlow

1. Navigate to the `/build` page
2. Click "New DataFlow"
3. Drag nodes from the sidebar onto the canvas
4. Connect nodes by dragging from one node's output (right) to another's input (left)
5. Select a node to configure its properties in the right panel
6. Click "Test Run" to execute your flow

### Example Flow

Create a simple flow to fetch and transform API data:

1. Add a **HTTP Request** node
   - Set URL to `https://jsonplaceholder.typicode.com/users/1`
   - Method: GET

2. Add a **Select** node
   - Connect it to the HTTP Request node
   - Configure fields: `name`, `email`, `address.city`

3. Add an **Inspect** node
   - Connect it to the Select node
   - This will show the final output

4. Click "Test Run" to see the results

## Project Structure

```
bs2/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── dataflows/    # DataFlow CRUD and execution
│   ├── build/            # Builder interface
│   │   └── dataflow/[id] # DataFlow editor page
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── dataflow/         # DataFlow-specific components
│   │   ├── nodes/       # Custom node components
│   │   ├── FlowEditor.tsx
│   │   ├── NodeSidebar.tsx
│   │   └── PropertiesPanel.tsx
│   └── ui/              # shadcn/ui components
├── lib/                  # Utility functions
│   ├── db/              # Database configuration
│   ├── executor/        # DataFlow execution engine
│   │   └── nodes/      # Node-specific executors
│   ├── stores/          # Zustand stores
│   └── types/           # TypeScript types
└── scripts/             # Utility scripts
    └── init-db.ts      # Database initialization
```

## Database Commands

```bash
# Start PostgreSQL (Docker)
pnpm db:start

# Stop PostgreSQL (Docker)
pnpm db:stop

# View database logs
pnpm db:logs

# Generate new migration
pnpm db:generate

# Push schema to database (without migrations)
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Initialize database (run migrations + seed)
pnpm db:init
```

## Development

The application uses auto-save, so changes to DataFlows are automatically persisted after 2 seconds of inactivity.

### Adding New Node Types

1. Create node UI component in `components/dataflow/nodes/`
2. Add to `nodeTypes` in `components/dataflow/nodes/index.ts`
3. Create executor in `lib/executor/nodes/`
4. Add case in `lib/executor/executor.ts`
5. Add to sidebar in `components/dataflow/NodeSidebar.tsx`

## Known Limitations (POC)

- No authentication (uses placeholder user)
- No multi-user support
- Limited error handling in UI
- No undo/redo functionality
- No DataFlow versioning

## Future Enhancements

- User authentication with NextAuth.js
- Additional node types (Database Query, Conditional, Loop)
- Session state management for cross-page data
- Visual page editor for building UIs
- Component library and data binding
- Real-time collaboration
- DataFlow templates and marketplace

## License

MIT

