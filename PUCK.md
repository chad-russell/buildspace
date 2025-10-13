================
CODE SNIPPETS
================
### Install and Run Puck Next.js Recipe

Source: https://github.com/puckeditor/puck/blob/main/apps/demo/README.md

Commands to generate a new Next.js app with Puck and start the development server.

```bash
npx create-puck-app my-app
yarn dev
```

--------------------------------

### Install and Run Puck Next.js Recipe

Source: https://github.com/puckeditor/puck/blob/main/recipes/next/README.md

Commands to generate a new Next.js app with Puck and start the development server. Navigate to the homepage to see the default content and access the editor via the /edit route.

```bash
npx create-puck-app my-app
yarn dev
```

--------------------------------

### Install and Run React Router App

Source: https://github.com/puckeditor/puck/blob/main/recipes/react-router/README.md

Commands to generate a new Puck application using the react-router recipe and start the development server.

```bash
npx create-puck-app my-app
yarn dev
```

--------------------------------

### Start Demo Application

Source: https://github.com/puckeditor/puck/blob/main/CONTRIBUTING.md

Navigates to the demo application directory and starts the development server. This is the recommended way to work on Puck.

```sh
cd apps/demo
yarn dev
```

--------------------------------

### Start Development Server

Source: https://github.com/puckeditor/puck/blob/main/recipes/remix/README.md

Command to start the development server for the Remix application.

```bash
yarn dev
```

--------------------------------

### PuckPreview Component Example with Custom Configuration

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/extending-puck/composition.mdx

This example showcases the usage of the `<PuckPreview>` component to render a custom Puck editor setup. It defines a `HeadingBlock` component and pre-populates content data, demonstrating how to integrate and display Puck's core components within a custom layout.

```tsx
<PuckPreview
  config={{
    components: {
      HeadingBlock: {
        render: () => {
          return <span>Hello, world</span>;
        },
      },
    },
  }}
  data={{
    content: [{ type: "HeadingBlock", props: { id: "HeadingBlock-1" } }],
    root: { props: {} },
  }}
>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gridGap: 16 }}>
    <div>
      <Puck.Components />
    </div>
    <div>
      <Puck.Preview />
    </div>
  </div>
</PuckPreview>
```

--------------------------------

### Install Puck

Source: https://github.com/puckeditor/puck/blob/main/README.md

Installs the Puck package using npm or creates a new Puck application.

```sh
npm i @measured/puck --save # or npx create-puck-app my-app
```

--------------------------------

### Install Dependencies

Source: https://github.com/puckeditor/puck/blob/main/CONTRIBUTING.md

Installs project dependencies using Yarn. This is a prerequisite for setting up the development environment.

```sh
yarn
```

--------------------------------

### Install Puck Editor

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/getting-started.mdx

Installs the Puck editor package using npm. This is the primary method for adding Puck to your project.

```sh
npm i @measured/puck --save
```

--------------------------------

### Drawer Usage Example

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/components/drawer.mdx

Demonstrates how to use the <Drawer> component with <Drawer.Item> to create a draggable list of components within a Puck editor setup. This example shows the basic structure for integrating custom components into the Puck UI.

```tsx
import { Puck, Drawer } from "@measured/puck";

export function Editor() {
  return (
    <Puck>
      <Drawer>
        <Drawer.Item name="Orange" />
      </Drawer>
    </Puck>
  );
}
```

--------------------------------

### Install @measured/puck-plugin-emotion-cache

Source: https://github.com/puckeditor/puck/blob/main/packages/plugin-emotion-cache/README.md

Installs the emotion cache plugin for Puck using npm.

```bash
npm i @measured/puck-plugin-emotion-cache
```

--------------------------------

### Install Heading Analyzer Plugin

Source: https://github.com/puckeditor/puck/blob/main/packages/plugin-heading-analyzer/README.md

Installs the Heading Analyzer plugin using npm. This is the first step to integrate the plugin into your project.

```sh
npm i @measured/puck-plugin-heading-analyzer
```

--------------------------------

### Install Puck App

Source: https://github.com/puckeditor/puck/blob/main/recipes/remix/README.md

Command to generate a new Puck application using create-puck-app.

```bash
npx create-puck-app my-app
```

--------------------------------

### Distributing Field Transforms as Plugins

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/extending-puck/field-transforms.mdx

Demonstrates packaging custom field transforms and overrides into a plugin for distribution. This example shows a plugin that wraps 'example' fields and defines a new 'example' field type with an input interface.

```tsx
const plugin = {
  fieldTransforms: {
    example: ({ value }) => <div>{value}</div>, // Wrap all example fields with divs
  },

  // This example combines transforms with overrides
  overrides: {
    fieldTypes: {
      example: () => <input />, // Define a field interface
    },
  },
};

const Example = () => <Puck plugins={[plugin]} />;
```

--------------------------------

### Tabs Example with Overlay Portals

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/integrating-puck/overlay-portals.mdx

An example showcasing the use of Overlay Portals for interactive previewing, specifically for paginating through tabs. This demonstrates how portals can manage state and user interaction within the Puck editor preview.

```tsx
import { OverlayPortalTabsPreview } from "@/docs/components/Preview";

// ... component definition for Example using OverlayPortalTabsPreview
// This snippet is a conceptual representation of the usage within the PuckPreview component.
// The actual implementation would involve the PuckPreview component setup.

// Example usage within PuckPreview:
// <PuckPreview
//   label="Tabs example"
//   config={{
//     components: {
//       Example: {
//         render: () => {
//           return <OverlayPortalTabsPreview />;
//         },
//       },
//     },
//   }}
//   data={{
//     content: [
//       {
//         type: "Example",
//         props: {
//           id: "Example-1",
//         },
//       },
//     ],
//     root: { props: {} },
//   }}
// >
//   <Puck.Preview />
// </PuckPreview>

```

--------------------------------

### Component Configuration Example

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/configuration/component-config.mdx

Defines the structure for a 'HeadingBlock' component, specifying its fields and render function. This serves as a basic example of how to configure a component in Puck.

```tsx
const config = {
  components: {
    HeadingBlock: {
      fields: {
        title: {
          type: "text",
        },
      },
      render: ({ title }) => <h1>{title}</h1>,
    },
  },
};
```

--------------------------------

### Getting Permissions

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/puck-api.mdx

Provides an example of calling `getPermissions` to retrieve the current user's permissions within the Puck editor.

```tsx
getPermissions();
// { delete: true, edit: true }
```

--------------------------------

### Puck Configuration Example

Source: https://github.com/puckeditor/puck/blob/main/recipes/remix/README.md

Illustrates how to integrate a custom Puck configuration within a Remix application.

```typescript
// /app/puck.config.tsx
// Implement your custom puck configuration here.
```

--------------------------------

### Create Puck Application

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/getting-started.mdx

Generates a new Puck application using a provided recipe. This command-line interface tool simplifies project setup.

```sh
npx create-puck-app my-app
```

--------------------------------

### Puck API Routes and Server Component Example

Source: https://github.com/puckeditor/puck/blob/main/recipes/next/README.md

Example API routes and server components for integrating Puck into a Next.js application. This includes handling Puck data via an HTTP API and implementing catch-all routes for dynamic page editing. **Note:** Authentication must be added to these routes to prevent public access.

```typescript
// Example API routes in /app/puck/api/route.ts
// Example server component in /app/puck/[...puckPath]/page.tsx
```

--------------------------------

### Dynamic Zone Migration Example (Before)

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/functions/migrate.mdx

Shows the data structure before applying a custom dynamic zone migration for a 'Columns' component.

```json
{
  "root": {
    "props": {
      "title": "Legacy Zones Migration"
    }
  },
  "content": [
    {
      "type": "Columns",
      "props": {
        "columns": [{}],
        "id": "Columns-eb9dfe22-4408-44e6-b8e5-fbaedbbdb3be"
      }
    }
  ],
  "zones": {
    "Columns-eb9dfe22-4408-44e6-b8e5-fbaedbbdb3be:column-0": [
      {
        "type": "Text",
        "props": {
          "text": "Drop zone 1",
          "id": "Text-c2b5c0a5-d76b-4120-8bb3-99934e119967"
        }
      }
    ]
  }
}
```

--------------------------------

### CSS Grid Layout Example

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/integrating-puck/multi-column-layouts.mdx

Demonstrates how to apply CSS grid to a slot for a two-column layout with a gap. This configuration is applied to the 'Example' component's render function.

```tsx
const config = {
  components: {
    Example: {
      fields: {
        content: {
          type: "slot",
        },
      },
      render: ({ content: Content }) => (
        <Content
          style={{
            // Use CSS grid in this slot
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 16,
          }}
        />
      ),
    },
    Card: {
      render: ({ text }) => <div>{text}</div>,
    },
  },
};
```

--------------------------------

### Select Input Configuration

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/fields/select.mdx

Demonstrates how to configure a 'select' input field with options and a render function. This example shows a basic setup for a text alignment control.

```tsx
const config = {
  components: {
    Example: {
      fields: {
        textAlign: {
          type: "select",
          options: [
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
          ],
        },
      },
      render: ({ textAlign }) => {
        return <p style={{ textAlign }}>Hello, world</p>;
      },
    },
  },
};
```

--------------------------------

### Puck Plugin Example

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/plugin.mdx

Demonstrates how to create and use a custom plugin in Puck to override UI elements. This example shows how to modify the appearance of a drawer item.

```tsx
import { Puck } from "@measured/puck";

const MyPlugin = {
  overrides: {
    drawerItem: ({ name }) => (
      <div style={{ backgroundColor: "hotpink" }}>{name}</div>
    ),
  },
};

export function Editor() {
  return (
    <Puck
      // ...
      plugins={[MyPlugin]}
    />
  );
}
```

--------------------------------

### Example Rendered HTML Output

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/integrating-puck/root-configuration.mdx

Illustrates the resulting HTML structure after the root and its child components (like HeadingBlock) are rendered based on the provided configuration and data payload.

```html
<!-- root render -->
<div>
  <!-- HeadingBlock render -->
  <h1>Hello, world</h1>

  <!-- Remaining nodes -->
</div>
```

--------------------------------

### Route Authentication Example

Source: https://github.com/puckeditor/puck/blob/main/recipes/remix/README.md

Demonstrates how to add authentication to Puck editor routes.

```typescript
// /app/routes/_index.tsx
// Modify this route to add authentication for /edit routes.

// /app/routes/edit.tsx
// Modify this route to add authentication for /edit routes.
```

--------------------------------

### Puck Data - Root Example

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/data-model/data.mdx

Example of the 'root' parameter within the Puck Data object, illustrating the configuration for the root element, including properties like 'title'.

```json
{
  "content": [],
  "root": {
    "props": {
      "title": "My page"
    }
  },
  "zones": {}
}
```

--------------------------------

### Puck Data - Zones Example

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/data-model/data.mdx

Example of the 'zones' parameter in the Puck Data object, demonstrating how nested content regions (DropZones) are defined with component instances.

```json
{
  "content": [],
  "root": {},
  "zones": {
    "HeadingBlock-1234:my-content": [
      {
        "type": "HeadingBlock",
        "props": {
          "id": "HeadingBlock-1234",
          "title": "Hello, world"
        }
      }
    ]
  }
}
```

--------------------------------

### Getting Item by Selector

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/puck-api.mdx

Illustrates how to retrieve component data using `getItemBySelector`, providing an example selector that targets a specific zone within a component.

```tsx
getItemBySelector({
  index: 0,
  zone: "Flex-123:children", // The "children" slot field in the component with id "Flex-123"
});
// { type: "HeadingBlock", props: {} }
```

--------------------------------

### Database Integration Example

Source: https://github.com/puckeditor/puck/blob/main/recipes/remix/README.md

Shows where to integrate database calls for Puck page data within the application's models.

```typescript
// /app/models/page.server.ts
// Integrate your database logic for fetching and saving page data.
```

--------------------------------

### Install @measured/puck-field-contentful

Source: https://github.com/puckeditor/puck/blob/main/packages/field-contentful/README.md

Installs the necessary package for integrating Puck with Contentful.

```sh
npm i @measured/puck-field-contentful
```

--------------------------------

### Database Integration Example

Source: https://github.com/puckeditor/puck/blob/main/recipes/react-router/README.md

Shows where to integrate your custom database logic within the '/lib/pages.server.ts' file for Puck.

```typescript
// In /lib/pages.server.ts
// Implement functions to interact with your database
// Example:
// export async function getPageData(slug) {
//   // Fetch data from your database
// }
// export async function savePageData(data) {
//   // Save data to your database
// }
```

--------------------------------

### Render with Config Example

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/components/render.mdx

Shows how to provide a configuration object to the Render component, defining a 'HeadingBlock' component.

```tsx
export function Example() {
  return (
    <Render
      config={{
        components: {
          HeadingBlock: {
            fields: {
              children: {
                type: "text",
              },
            },
            render: ({ children }) => {
              return <h1>{children}</h1>;
            },
          },
        },
      }}
      // ...
    />
  );
}
```

--------------------------------

### Object Component Configuration Example

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/fields/object.mdx

Demonstrates the basic configuration for an Object component, specifying its fields and a render function. This example shows how to define nested object fields and their types.

```tsx
const config = {
  components: {
    Example: {
      fields: {
        params: {
          type: "object",
          objectFields: {
            title: { type: "text" },
          },
        },
      },
      render: ({ params }) => {
        return <p>{params.title}</p>;
      },
    },
  },
};
```

--------------------------------

### Puck Component Configuration Example for Text Field

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/integrating-puck/component-configuration.mdx

This snippet provides another example of a Puck component configuration, focusing on a simple text field. It illustrates the use of `defaultProps` to set an initial 'Hello, world' value for the 'title' field, demonstrating how these properties are applied within a component's definition, as used in a `ConfigPreview` component.

```tsx
{
    fields: {
      title: {
        type: "text",
      },
    },
    defaultProps: {
      title: "Hello, world",
    },
    render: ({ title }) => {
      return <span>{title}</span>;
    },
  }
```

--------------------------------

### Example: Render Page Data as JSON using Composition

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/extending-puck/internal-puck-api.mdx

A practical example demonstrating how to use the internal Puck API within a composition to render the page data as JSON. It utilizes the `usePuck` hook to access the `appState`.

```tsx
import { Puck, createUsePuck } from "@measured/puck";

const usePuck = createUsePuck();

const JSONRenderer = () => {
  const appState = usePuck((s) => s.appState);

  return <div>{JSON.stringify(appState.data)}</div>;
};

export function Editor() {
  return (
    <Puck>
      <JSONRenderer />
    </Puck>
  );
}
```

--------------------------------

### Puck API Routes and Server Component Example

Source: https://github.com/puckeditor/puck/blob/main/apps/demo/README.md

Illustrates the structure of API routes and server components for integrating Puck into a Next.js application. Emphasizes the need for authentication and database integration.

```typescript
// Example API route structure (e.g., /app/api/puck/route.ts)
// Needs authentication and database integration.

// Example Server Component structure (e.g., /app/[...puckPath]/page.tsx)
// Needs authentication and database integration.
```

--------------------------------

### Dynamic Zone Migration Example (After)

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/functions/migrate.mdx

Illustrates the data structure after applying a custom dynamic zone migration, where zone content is integrated into the 'Columns' component's props.

```json
{
  "root": {
    "props": {
      "title": "Legacy Zones Migration"
    }
  },
  "content": [
    {
      "type": "Columns",
      "props": {
        "columns": [
          {
            "column": [
              {
                "type": "Text",
                "props": {
                  "text": "Drop zone 1",
                  "id": "Text-c2b5c0a5-d76b-4120-8bb3-99934e119967"
                }
              }
            ]
          }
        ],
        "id": "Columns-eb9dfe22-4408-44e6-b8e5-fbaedbbdb3be"
      }
    }
  ]
}
```

--------------------------------

### Puck Data - Content Example

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/data-model/data.mdx

Example of the 'content' parameter within the Puck Data object, showcasing an array of component data, including a 'HeadingBlock'.

```json
{
  "content": [
    {
      "type": "HeadingBlock",
      "props": {
        "id": "HeadingBlock-1234",
        "title": "Hello, world"
      }
    }
  ],
  "root": {},
  "zones": {}
}
```

--------------------------------

### Drawer Component Props Reference

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/components/drawer.mdx

Documents the available properties for the `<Drawer>` component, including their types, examples, and status (e.g., required).

```APIDOC
Drawer Component:
  Props:
    children:
      Type: ReactNode
      Status: Required
      Example: children: <Drawer.Item />
      Description: A React node representing the contents of the <Drawer>. Will likely contain <Drawer.Item> nodes.
```

--------------------------------

### Render with Data Example

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/components/render.mdx

Illustrates how to provide data to the Render component, specifying content for the 'HeadingBlock'.

```tsx
export function Example() {
  return (
    <Render
      data={{
        content: [
          {
            props: { children: "Hello, world", id: "id" },
            type: "HeadingBlock",
          },
        ],
        root: {},
      }}
      // ...
    />
  );
}
```

--------------------------------

### Asynchronous Feature Toggling with Server Data

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/integrating-puck/feature-toggling.mdx

Demonstrates how to resolve permissions asynchronously by fetching data from a server endpoint, for example, to get permissions based on a component's ID.

```tsx
const config = {
  components: {
    HeadingBlock: {
      resolvePermissions: async (data) => {
        const serverPermissions = await myPermissionsApi(data.props.id); // Query permissions from a server

        return serverPermissions;
      },
      // ...
    },
  },
};
```

--------------------------------

### Data Model Migration: DropZone to Slot

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/guides/migrations/dropzones-to-slots.mdx

Illustrates the change in data structure when migrating from DropZones to Slots. The 'Before' example shows data organized in a global 'zones' object, while the 'After' example demonstrates the inline, recursive data model where slot data is part of the component's props.

```json
{
  "content": [
    {
      "type": "Grid",
      "props": {
        "id": "Grid-12345"
      }
    }
  ],
  "zones": {
    "Grid-12345:items": [
      {
        "type": "HeadingBlock",
        "props": {
          "id": "Heading-12345",
          "title": "Hello, world"
        }
      }
    ]
  }
}
```

```json
{
  "content": [
    {
      "type": "Grid",
      "props": {
        "id": "Grid-12345",
        "items": [
          {
            "type": "HeadingBlock",
            "props": {
              "id": "Heading-12345",
              "title": "Hello, world"
            }
          }
        ]
      }
    }
  ]
}
```

--------------------------------

### Root Data to Props Migration Example

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/functions/migrate.mdx

Demonstrates the transformation of data where props stored on the root level are moved to the 'props' object.

```json
{
  "root": {
    "title": "Hello, world"
  }
}
```

```json
{
  "root": {
    "props": { "title": "Hello, world" }
  }
}
```

--------------------------------

### Example Data Payload for Root Fields

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/integrating-puck/root-configuration.mdx

Shows a sample JSON data payload structure that includes props for the root component, such as 'title' and 'description', as defined in the configuration.

```json
{
  "content": [
    // ...
  ],
  "root": {
    "props": {
      "title": "Hello, world",
      "description": "Lorem ipsum"
    }
  }
}
```

--------------------------------

### Puck Plugin: UI Overrides Example

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/extending-puck/plugins.mdx

Illustrates how to use the `overrides` property within a Puck plugin to customize the user interface. This example targets `drawerItem` to change the display color of items in the drawer.

```javascript
const plugin = {
  overrides: {
    // Make all drawer items pink
    drawerItem: ({ name }) => <div style={{ color: "hotpink" }}>{name}</div>,
  },
};
```

--------------------------------

### ActionBar Component API

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/overrides/action-bar.mdx

API reference for the ActionBar component, detailing its props, their types, and usage examples.

```APIDOC
ActionBar Component Props:

children:
  - Type: ReactNode
  - Description: A fragment containing the default actions. Should normally be rendered inside an <ActionBar.Group>.
  - Example: <div />

label:
  - Type: String
  - Description: The default label for the action bar.
  - Example: "HeadingBlock"

parentAction:
  - Type: ReactNode
  - Description: A single <ActionBar.Action> to select the current component's parent.
  - Example: <div />
```

--------------------------------

### Configure Puck Component with Default Props for Slot Content

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/integrating-puck/multi-column-layouts.mdx

This TypeScript/TSX code defines a Puck component configuration (`config`) for an `Example` component. It utilizes a `slot` field type and `defaultProps` to pre-populate the slot with a `Card` component containing specific text when the `Example` component is inserted. It also includes the definition for the simple `Card` component.

```tsx
const config = {
  components: {
    Example: {
      fields: {
        content: {
          type: "slot",
        },
      },
      defaultProps: {
        content: [
          {
            type: "Card",
            props: {
              text: "Pre-populated",
            },
          },
        ],
      },
      render: ({ content: Content }) => <Content />,
    },
    Card: {
      render: ({ text }) => <div>{text}</div>,
    },
  },
};
```

--------------------------------

### Basic Puck.Preview Usage

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/components/puck-preview.mdx

Demonstrates the fundamental usage of the Puck.Preview component within a Puck editor setup. It shows how to render the preview component as a child of the main Puck component.

```tsx
import { Puck } from "@measured/puck";

export function Editor() {
  return (
    <Puck>
      <Puck.Preview />
    </Puck>
  );
}
```

--------------------------------

### Puck Editor API Reference

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/components/puck.mdx

Documentation for Puck editor props, including detailed explanations of parameters, types, and usage examples.

```APIDOC
PuckEditorProps:
  data: object
    The initial data to render. Cannot be changed once mounted.
  children: ReactNode
    Render custom nodes to create compositional interfaces.
  dnd: {
    disableAutoScroll?: boolean
  }
    Configure drag-and-drop behavior.
    - disableAutoScroll: Disable auto-scroll when dragging items near the edge of the preview area.
  fieldTransforms: {
    [fieldName: string]: (field: { value: any }) => ReactNode
  }
    Specify transforms to modify field values before being passed to the editor canvas.
  headerPath: string
    Set a path to show after the header title.
  headerTitle: string
    Set the title shown in the header.
  iframe: {
    enabled?: boolean
    waitForStyles?: boolean
  }
    Configure the iframe behavior.
    - enabled: Render the Puck preview within an iframe. Defaults to true. Disabling iframes also disables viewports.
    - waitForStyles: Defer rendering of the Puck preview until iframe styles have loaded, showing a spinner. Defaults to true.
  initialHistory: {
    histories: Array<{ state: object }>
    index: number
    appendData?: boolean
  }
    Sets the undo/redo Puck history state.
    - histories: An array of histories to reset the Puck state history to. (Required)
    - index: The index of the histories to set the user to. (Required)
    - appendData: Append the Puck data prop onto the end of histories. Defaults to true. When false, the Puck data prop will be ignored but you must specify at least one item in the histories array.
```

--------------------------------

### RootData with Type and Props

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/data-model/root-data.mdx

Illustrates a more complete RootData object, specifying the 'type' of the component and its associated 'props'. This example is crucial for understanding how components are identified and configured.

```json
{
  "type": "HeadingBlock",
  "props": {
    "id": "HeadingBlock-1234",
    "title": "Hello, world"
  }
}
```

--------------------------------

### Custom Puck Configuration Example

Source: https://github.com/puckeditor/puck/blob/main/recipes/react-router/README.md

Demonstrates how to implement a custom Puck configuration in '/app/puck.config.tsx'.

```typescript
// In /app/puck.config.tsx
// Define custom components, fields, and configurations
// Example:
// import { Config } from '@measured/puck'
// const config: Config = {
//   components: {
//     Hero: { render: MyHeroComponent },
//   }
// }
// export default config
```

--------------------------------

### DropZones to Slots Migration Example

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/functions/migrate.mdx

Illustrates the migration of DropZone data from 'zones' to inline 'slots'. This requires a 'config' object with matching slot field names.

```json
{
  "content": [
    {
      "type": "Grid",
      "props": {
        "id": "Grid-12345"
      }
    }
  ],
  "zones": {
    "Grid-12345:items": [
      {
        "type": "HeadingBlock",
        "props": {
          "id": "Heading-12345",
          "title": "Hello, world"
        }
      }
    ]
  }
}
```

```json
{
  "content": [
    {
      "type": "Grid",
      "props": {
        "id": "Grid-12345",
        "items": [
          {
            "type": "HeadingBlock",
            "props": {
              "id": "Heading-12345",
              "title": "Hello, world"
            }
          }
        ]
      }
    }
  ]
}
```

--------------------------------

### Puck Component Props

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/components/puck.mdx

Details the various props available for the Puck component, including their types, examples, and requirements.

```APIDOC
Puck Component Props:

- config: An object describing the available components, fields and more. See the [Config](/docs/api-reference/configuration/config) docs for a full reference. (Required)
- data: The data model for the Puck editor. (Required)
- dnd: Configuration for drag and drop functionality.
- children: Allows custom rendering of children, e.g., <Puck.Preview />.
- fieldTransforms: Transforms for fields within components.
- headerPath: Path for the editor header.
- headerTitle: Title for the editor header.
- iframe: Configuration for iframe rendering.
- initialHistory: Initial state for the undo/redo history.
- metadata: Additional metadata for the editor.
- onAction: Callback function triggered on editor actions.
- onChange: Callback function triggered when the editor data changes.
- onPublish: Async callback function triggered when data is published.
- overrides: Experimental prop for overriding default component behaviors.
- permissions: Experimental prop for defining user permissions.
- plugins: Array of plugins to extend Puck's functionality.
- ui: Configuration for the user interface, e.g., sidebar visibility.
- viewports: Defines available viewports for responsive testing.
```

--------------------------------

### RootData Structure

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/data-model/root-data.mdx

Defines the basic structure of the RootData object, including its properties and their types. This serves as a foundational example for data representation within Puck.

```json
{
  "props": {
    "title": "Hello, world"
  }
}
```

--------------------------------

### Create Puck App with Recipes

Source: https://github.com/puckeditor/puck/blob/main/README.md

Uses `create-puck-app` to quickly set up a pre-configured application based on provided recipes for different frameworks like Next.js, Remix, and React Router.

```sh
npx create-puck-app my-app
```

--------------------------------

### Puck Component Props

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/overrides/puck.mdx

Details the props available for the Puck component. It highlights the 'children' prop, its type, and provides an example of its usage.

```APIDOC
Puck Component:
  Props:
    children: ReactNode
      The default node for the <Puck> children.
      Example: <div />
```

--------------------------------

### Implementing Drop Zones with renderDropZone

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/configuration/component-config.mdx

Provides an example of using `puck.renderDropZone` to create a drop zone for nested components. This method is recommended for React server components.

```tsx
const config = {
  components: {
    Example: {
      render: ({ puck: { renderDropZone } }) => {
        return <div>{renderDropZone({ zone: "my-content" })}</div>;
      },
    },
  },
};
```

--------------------------------

### Hybrid Authoring Configuration Example

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/integrating-puck/external-data-sources.mdx

This example demonstrates configuring a Puck component for hybrid authoring. It defines 'data' as an external field with a `fetchList` function and 'title' as a text field. The `resolveData` function maps data from 'data.title' to 'title' and controls the read-only state of the 'title' field.

```tsx
const config = {
  components: {
    Example: {
      fields: {
        data: {
          type: "external",
          getItemSummary: (item) => item.title,
          fetchList: async () => {
            return [
              { title: "Hello, world", description: "Lorem ipsum 1" },
              { title: "Goodbye, world", description: "Lorem ipsum 2" },
            ];
          },
        },
        title: {
          type: "text",
        },
      },
      resolveData: async ({ props }, { changed }) => {
        // Remove read-only from the title field if `data` is empty
        if (!props.data) return { props, readOnly: { title: false } };

        // Don't query unless `data` has changed since resolveData was last run
        if (!changed.data) return { props };

        return {
          props: {
            title: props.data.title,
            readOnly: { title: true },
          },
        };
      },
      render: ({ title }) => <b>{title}</b>,
    },
  },
};
```

--------------------------------

### Component Data Payload Example

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/integrating-puck/component-configuration.mdx

Illustrates the JSON data payload generated by Puck when a 'HeadingBlock' component is used. This payload includes the component type and its properties.

```json
{
  "content": [
    {
      "type": "HeadingBlock",
      "props": {
        "id": "HeadingBlock-1234"
      }
    }
  ],
  "root": {}
}
```

--------------------------------

### TSX: Conditionally Trigger Async Operation in `resolvePermissions`

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/configuration/component-config.mdx

An example demonstrating how `resolvePermissions` can be used to conditionally trigger an asynchronous operation. It returns `lastPermissions` if a specific `example` prop has not changed, optimizing performance by avoiding expensive calls.

```tsx
const resolvePermissions = async ({ props }, { changed, lastPermissions }) => {
  if (!changed.example) {
    return lastPermissions; // Return the last permissions unless the `example` prop has changed
  }

  return await expensiveAsyncOperation();
};
```

--------------------------------

### React Router Authentication Example

Source: https://github.com/puckeditor/puck/blob/main/recipes/react-router/README.md

Illustrates how to add authentication to '/edit' routes by modifying the route module action in the splat route.

```typescript
// In /app/routes/puck-splat.tsx
// Modify the route module action to include authentication logic
// Example: 
// export async function action({ request }) {
//   if (!isAuthenticated(request)) { 
//     throw new Response('Unauthorized', { status: 401 });
//   }
//   // ... Puck logic
```

--------------------------------

### Getting Item by ID

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/puck-api.mdx

Demonstrates the usage of `getItemById` to fetch component data by its unique identifier.

```tsx
getItemById("HeadingBlock-123");
// { type: "HeadingBlock", props: {} }
```

--------------------------------

### PuckApi Methods

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/puck-api.mdx

Provides access to Puck's core functionalities for customization. Includes methods for accessing application state, dispatching actions, retrieving items by selector or ID, getting selectors, managing permissions, and accessing history.

```APIDOC
PuckApi:
  appState: The current application state for this Puck instance.
    Example: { data: {}, ui: {} }
    Type: AppState

  dispatch(action: PuckAction): void
    Execute an action to mutate the Puck application state.
    Example: dispatch({ type: "setUi", ui: { leftSideBarVisible: false } })
    Type: Function

  getItemBySelector(selector: ItemSelector): ComponentData
    Get an item's ComponentData by its selector.
    Example: getItemBySelector({ index: 0, zone: "Flex-123:children" })
    Returns: { type: "HeadingBlock", props: {} }
    Type: Function

  getItemById(id: string): ComponentData
    Get an item's ComponentData by its component id.
    Example: getItemById("HeadingBlock-123")
    Returns: { type: "HeadingBlock", props: {} }
    Type: Function

  getSelectorForId(id: string): ItemSelector
    Get an item's selector by its component id.
    Example: getSelectorForId("HeadingBlock-123")
    Returns: { index: 0, zone: "Flex-123:children" }
    Type: Function

  getPermissions(params?: GetPermissionsParams): Permissions
    Get global, component or resolved dynamic permissions.
    Example: getPermissions()
    Returns: { delete: true, edit: true }
    Params:
      item: ComponentData
      root: boolean
      type: string
    Type: Function

  history: Object
    Access to the history object.
    Example: {}

  refreshPermissions(params?: RefreshPermissionsParams): void
    Refresh permissions.
    Example: refreshPermissions()
    Type: Function

  selectedItem: ComponentData
    The currently selected item.
    Example: { type: "Heading", props: {id: "my-heading"} }
    Type: ComponentData
```

--------------------------------

### Puck Slot Configuration Example

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/fields/slot.mdx

Demonstrates how to configure a 'slot' type field within a Puck component. This allows for drag-and-drop functionality for nested components.

```tsx
const config = {
  components: {
    Example: {
      fields: {
        content: {
          type: "slot",
        },
      },
      render: ({ content: Content }) => {
        return <Content />;
      },
    },
    Card: {
      render: () => <div>Hello, world</div>,
    },
  },
};
```

--------------------------------

### Render with Metadata Example

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/components/render.mdx

Demonstrates passing metadata to the Render component and accessing it within a component's render function.

```tsx
export function Example() {
  return (
    <Render
      metadata={{ title: "Hello, world" }}
      config={{
        HeadingBlock: {
          render: ({ puck }) => {
            return <h1>{puck.metadata.title}</h1>; // "Hello, world"
          },
        },
      }}
      // ...
    />
  );
}
```

--------------------------------

### Puck Plugin: Field Transforms Example

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/extending-puck/plugins.mdx

An example of a Puck plugin that utilizes `fieldTransforms` to modify how specific field types are rendered in the editor. This snippet specifically targets the 'text' field type to display its value in hotpink.

```javascript
const plugin = {
  fieldTransforms: {
    // Make all props powered by "text" field pink in the editor
    text: ({ value }) => <span style={{ color: "hotpink" }}>{value}</span>,
  },
};
```

--------------------------------

### Textarea Component Configuration

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/fields/textarea.mdx

Defines the configuration for a Textarea component, including its fields and render function. This example shows how to set up a 'textarea' type field named 'description'.

```tsx
const config = {
  components: {
    Example: {
      fields: {
        description: {
          type: "textarea",
        },
      },
      render: ({ description }) => {
        return <p>{description}</p>;
      },
    },
  },
};
```

--------------------------------

### Live Preview of Asynchronous Dynamic Fields in TSX

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/integrating-puck/dynamic-fields.mdx

Presents an interactive `ConfigPreview` example of asynchronous dynamic field resolution. It simulates an API call to fetch options for the 'item' field based on the 'category' selection, illustrating how dynamic fields can be populated with data loaded asynchronously and displayed in a live context.

```tsx
resolveFields: async (data, { changed, lastFields }) => {
  if (!changed.category) return lastFields;

  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    category: {
      type: "radio",
      options: [
        { label: "Fruit", value: "fruit" },
        { label: "Vegetables", value: "vegetables" },
      ],
    },
    item: {
      type: "select",
      options:
        data.props.category === "fruit"
          ? [
            { label: "Select a fruit", value: "" },
            { label: "Apple", value: "apple" },
            { label: "Orange", value: "orange" },
            { label: "Tomato", value: "tomato" }
          ] : [
            { label: "Select a vegetable", value: "" },
            { label: "Broccoli", value: "broccoli" },
            { label: "Cauliflower", value: "cauliflower" },
            { label: "Mushroom", value: "mushroom" },
          ],
    },
  };
},

defaultProps: {
  category: "fruit",
  item: "",
},
render: ({ item }) => <p>{item}</p>,
```

--------------------------------

### Radio Input Configuration Example

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/fields/radio.mdx

Demonstrates how to configure a radio input field with options and a default value. This includes defining the field type, available options, default props, and a render function.

```tsx
const config = {
  components: {
    Example: {
      fields: {
        textAlign: {
          type: "radio",
          options: [
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
          ],
        },
      },
      defaultProps: {
        textAlign: "left",
      },
      render: ({ textAlign }) => {
        return <p style={{ textAlign }}>Hello, world</p>;
      },
    },
  },
};
```

--------------------------------

### Drawer.Item Component API Reference

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/api-reference/components/drawer-item.mdx

This section provides a comprehensive API reference for the <Drawer.Item> component, detailing its properties, their types, examples, and descriptions. It covers required and optional props like `name`, `children`, `id`, and `isDragDisabled`, explaining their purpose and behavior within the Puck editor.

```APIDOC
<Drawer.Item> Component Props:
  name:
    Type: String
    Status: Required
    Example: "name: \"Orange\""
    Description: The name of this drawer item. This will be rendered on the item by default. Will be used as the `id`, unless otherwise specified.
  children:
    Type: Function
    Status: Optional
    Example: "children: () => <div />"
    Description: A custom render function to render inside the component.
    Render Props:
      children:
        Type: String
        Example: "children: <div />"
        Description: The original node for the drawer item.
  id:
    Type: String
    Status: Optional
    Example: "id: \"OrangeComponent\""
    Description: A unique id for this drawer item. Defaults to the value of `name`. If using the `<Drawer>` as a component list to be dragged into `<Puck.Preview>`, this should be the key of a component defined in the [Config](/docs/api-reference/configuration/config).
  isDragDisabled:
    Type: Boolean
    Status: Optional
    Example: "isDragDisabled: false"
    Description: Whether or not this item is disabled.
```

--------------------------------

### Custom Editor Layout with Puck Components

Source: https://github.com/puckeditor/puck/blob/main/apps/docs/pages/docs/extending-puck/composition.mdx

Demonstrates how to create a custom editor layout by composing Puck's core components within the <Puck> component. This example renders a drag-and-drop preview and a component list side-by-side.

```tsx
import { Puck } from "@measured/puck";

export function Editor() {
  return (
    <Puck>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gridGap: 16 }}
      >
        <div>
          {/* Render the drag-and-drop preview */}
          <Puck.Preview />
        </div>
        <div>
          {/* Render the component list */}
          <Puck.Components />
        </div>
      </div>
    </Puck>
  );
}
```