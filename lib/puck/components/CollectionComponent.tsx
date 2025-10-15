import { ComponentConfig } from "@measured/puck"
import { UnifiedBindingField } from "../fields/UnifiedBindingField"
import { usePageState } from "../context/PageStateContext"
import { CollectionItemPropsProvider } from "../context/CollectionItemContext"
import { resolveBinding } from "../utils/binding-resolver"

export interface CollectionProps {
  itemsStateKey: string
  layout: "horizontal" | "vertical" | "grid"
  content: any[]
}

export const CollectionComponent: ComponentConfig<CollectionProps> = {
  fields: {
    itemsStateKey: UnifiedBindingField,
    layout: {
      type: "radio",
      options: [
        { label: "Horizontal", value: "horizontal" },
        { label: "Vertical", value: "vertical" },
        { label: "Grid", value: "grid" },
      ],
    },
    content: {
      type: "slot",
      label: "Item Template",
    },
  },
  defaultProps: {
    itemsStateKey: "@pageState.items",
    layout: "vertical",
    content: [],
  },
  render: ({ itemsStateKey, layout, content: Content, puck }) => {
    // Try to access page state
    let pageState: any = null
    try {
      const context = usePageState()
      pageState = context.pageState
    } catch {
      // Not in PageStateProvider context
    }

    // Resolve items from binding
    const items = resolveBinding(itemsStateKey, {
      pageState,
      markedInputs: (puck as any)?.metadata?.markedInputs,
    }) ?? []

    const containerByLayout: Record<string, string> = {
      horizontal: "flex flex-row gap-4",
      vertical: "flex flex-col gap-4",
      grid: "grid grid-cols-3 gap-4",
    }

    const isArray = Array.isArray(items)
    const hasItems = isArray && items.length > 0
    
    // If we have items, always render them (in both edit and preview mode)
    if (hasItems) {
      return (
        <div
          className={`${containerByLayout[layout] || containerByLayout.vertical} p-4 border border-gray-200 rounded-md bg-white min-h-[100px]`}
        >
          {items.map((item: any, index: number) => (
            <CollectionItemPropsProvider key={index} value={item}>
              <Content />
            </CollectionItemPropsProvider>
          ))}
        </div>
      )
    }

    // No items - show the template editor in edit mode
    return (
      <div className="p-4 border border-gray-200 rounded-md bg-white min-h-[100px]">
        <div className="text-xs text-gray-600 mb-2 font-medium">
          Item Template (drag components here):
        </div>
        <div className="border border-dashed border-blue-300 rounded bg-blue-50/30 p-2 min-h-[60px]">
          <Content />
        </div>
        <div className="text-xs text-gray-600 p-2 border border-dashed border-gray-300 rounded bg-gray-50 mt-2">
          {!isArray && itemsStateKey
            ? `Expected an array at: ${itemsStateKey}`
            : !itemsStateKey
            ? "Bind itemsStateKey to a page-state array"
            : "No items in collection (empty array)"}
        </div>
      </div>
    )
  },
}


