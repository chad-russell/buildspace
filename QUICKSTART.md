# Quick Start Guide

Get BuildSpace up and running in 5 minutes.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)

## Setup Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start PostgreSQL

Start the database with Docker Compose:

```bash
pnpm db:start
```

Wait a few seconds for PostgreSQL to fully start up.

### 3. Configure Database

Your `.env.local` should contain (this should already be set):

```env
DATABASE_URL="postgresql://buildspace:buildspace@localhost:5432/buildspace"
```

The Docker setup automatically creates the database with these credentials.

### 4. Initialize Database

Run migrations and create the placeholder user:

```bash
pnpm db:init
```

You should see:
```
✓ Migrations completed successfully!
✓ Database initialized successfully!
```

### 5. Start the App

```bash
pnpm dev
```

Open http://localhost:3000

## Creating Your First DataFlow

### Example: Fetch and Transform User Data

1. **Navigate to Builder**
   - Click "Get Started" on the home page
   - Click "New DataFlow"

2. **Add HTTP Request Node**
   - Drag "HTTP Request" from the left sidebar onto the canvas
   - Click the node to select it
   - In the right panel, configure:
     - URL: `https://jsonplaceholder.typicode.com/users/1`
     - Method: GET

3. **Add Inspect Node**
   - Drag "Inspect" node onto the canvas
   - Connect HTTP Request output to Inspect input
   - This will visualize the final output

4. **Test Run**
   - Click "Test Run" button in the top right
   - Check the browser console to see execution results
   - You should see the transformed data with just name, email, and city

## Example: Static Data Flow

1. Create a new DataFlow
2. Add a **Data** node
3. Click the node and edit the JSON in the properties panel:
   ```json
   {
     "message": "Hello, BuildSpace!",
     "timestamp": "2024-10-12",
     "items": [1, 2, 3]
   }
   ```
4. Add an **Inspect** node and connect them
5. Click "Test Run"

## Troubleshooting

### Database Connection Error

- Check if Docker container is running: `docker ps`
- Start the database: `pnpm db:start`
- View logs: `pnpm db:logs`
- Verify DATABASE_URL in `.env.local` matches: `postgresql://buildspace:buildspace@localhost:5432/buildspace`

### Port 5432 Already in Use

If you have another PostgreSQL instance running:
- Stop it: `sudo systemctl stop postgresql` (Linux) or `brew services stop postgresql` (Mac)
- Or change the port in `docker-compose.yml` and update `.env.local`

### Port 3000 Already in Use

If port 3000 is in use, start on a different port:
```bash
pnpm dev -- -p 3001
```

### Missing Dependencies

```bash
pnpm install
```

### Docker Issues

```bash
# Stop and remove containers/volumes
pnpm db:stop
docker compose down -v

# Restart fresh
pnpm db:start
pnpm db:init
```

## Next Steps

- Explore the [README.md](./README.md) for detailed documentation
- Try creating more complex flows with multiple nodes
- Check out the project structure to understand the codebase
- Experiment with different node types and combinations

## Getting Help

- Check the console for error messages
- Use the browser DevTools Network tab to debug API calls
- Review the execution results in the console after "Test Run"

