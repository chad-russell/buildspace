# Custom Components Feature

## Overview

Custom components allow users to create reusable UI components that can be used across all applications (DataFlows). Components are built using the Puck visual editor, accept props via a defined schema, and support full nesting.

## Architecture

### Database Schema

A new `custom_components` table stores:
- Component name
- Props schema (array of prop definitions with type, default value, label)
- Puck data (visual component layout)
- User ownership

### API Routes

- `GET /api/custom-components` - List all custom components for a user
- `POST /api/custom-components` - Create new custom component
- `GET /api/custom-components/[id]` - Get single component
- `PUT /api/custom-components/[id]` - Update component
- `DELETE /api/custom-components/[id]` - Delete component

### Dynamic Component System

Custom components are dynamically loaded and registered with Puck:

1. **Component Loading** (`lib/puck/custom-components.ts`)
   - Fetches custom components from API
   - Converts component records to Puck ComponentConfig
   - Builds dynamic config merging built-in and custom components

2. **Runtime Rendering** (`lib/puck/components/CustomComponentWrapper.tsx`)
   - Wrapper component that fetches and renders custom components
   - Handles loading and error states
   - Passes props to nested Puck content

3. **Props Resolution** (`lib/puck/metadata.ts`)
   - Resolves component props at runtime
   - Supports literal values, page state references, server data references

## User Interface

### Management Page (`/build/custom-components`)

- Lists all custom components
- Shows component name, prop count, and element count
- Create, edit, and delete actions

### Component Editor (`/build/custom-components/[id]`)

- Left sidebar: Props schema editor
  - Add/remove props
  - Define prop types (string, number, boolean, object)
  - Set default values and labels
- Center: Puck visual editor
  - Drag and drop built-in components
  - Nest other custom components
  - Design component layout
- Preview mode: View component with mock props

### Integration

- Custom components appear in the page editor component list
- Prefixed with "Custom_" to avoid name collisions
- Available alongside built-in components (Text, Heading, Container, etc.)
- Work in both design mode and runtime/preview mode

## Usage Flow

1. **Create Component**
   - Navigate to `/build/custom-components`
   - Click "New Component"
   - Name the component

2. **Define Props**
   - Add props in the left sidebar
   - Specify type, default value, and optional label
   - Props become fields when using the component

3. **Design Layout**
   - Use Puck editor to build component UI
   - Add Text, Heading, Container, DataDisplay, etc.
   - Nest other custom components

4. **Save**
   - Click "Save Component"
   - Component becomes available in all page editors

5. **Use in Pages**
   - Open any page editor
   - Find custom component in component list (prefixed with "Custom_")
   - Drag onto page
   - Configure props in properties panel

## Technical Details

### Props Schema

```typescript
interface PropField {
  key: string
  type: "string" | "number" | "boolean" | "object"
  defaultValue: any
  label?: string
}
```

### Component Nesting

Custom components can contain:
- All built-in components
- Other custom components (full nesting support)
- No circular dependency checks yet (future enhancement)

### Runtime Performance

- Components fetched once on page load
- Cached in component state
- Lazy loading for component definitions
- No re-fetching during interaction

## Setup

1. **Apply Database Migration**
   ```bash
   # Start database
   docker-compose up -d
   
   # Apply migration
   npm run db:push
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Test the Feature**
   - Visit http://localhost:3000/build
   - Click "Components" button
   - Create a test component
   - Use it in a page

## Future Enhancements

- [ ] Circular dependency detection
- [ ] Component versioning
- [ ] Component sharing/marketplace
- [ ] Component categories/tags
- [ ] Component search and filtering
- [ ] Component preview thumbnails
- [ ] Props validation and constraints
- [ ] Conditional props (show/hide based on other props)
- [ ] Prop groups and sections
- [ ] Component documentation/description
- [ ] Component usage analytics
- [ ] Export/import components

