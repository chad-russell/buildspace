import React from "react"
import { Config, ComponentConfig } from "@measured/puck"
import { CustomComponent } from "@/lib/db/schema"
import { CustomComponentWrapper } from "./components/CustomComponentWrapper"
import { UnifiedBindingField } from "./fields/UnifiedBindingField"

/**
 * Fetches custom components from the API for a given user
 */
export async function loadCustomComponents(
  userId: string
): Promise<CustomComponent[]> {
  try {
    const response = await fetch(
      `/api/custom-components?userId=${encodeURIComponent(userId)}`
    )
    if (!response.ok) {
      console.error("Failed to fetch custom components")
      return []
    }
    return await response.json()
  } catch (error) {
    console.error("Error loading custom components:", error)
    return []
  }
}

/**
 * Converts a custom component record into a Puck ComponentConfig
 */
export function createCustomComponentConfig(
  component: CustomComponent
): ComponentConfig<any> {
  // Create fields object from propsSchema
  const fields: Record<string, any> = {}
  const defaultProps: Record<string, any> = {}

  component.propsSchema.forEach((prop) => {
    // Create field based on prop type
    switch (prop.type) {
      case "string":
        fields[prop.key] = {
          type: "text",
          label: prop.label || prop.key,
        }
        break
      case "number":
        fields[prop.key] = {
          type: "number",
          label: prop.label || prop.key,
        }
        break
      case "boolean":
        // Use UnifiedBindingField to support both literal values and @ syntax bindings
        // Accepts: "true", "yes", "false", "no" (case-insensitive), or @pageState.key, @inputs.path, @props.key
        fields[prop.key] = UnifiedBindingField
        break
      case "object":
        fields[prop.key] = {
          type: "textarea",
          label: prop.label || prop.key,
        }
        break
    }

    defaultProps[prop.key] = prop.defaultValue
  })

  return {
    fields,
    defaultProps,
    render: (renderProps) => {
      return <CustomComponentWrapper componentId={component.id} props={renderProps} />
    },
  }
}

/**
 * Builds a dynamic Puck config by merging built-in and custom components
 */
export function buildDynamicPuckConfig(
  baseConfig: Config,
  customComponents: CustomComponent[]
): Config {
  const customComponentConfigs: Record<string, ComponentConfig<any>> = {}

  customComponents.forEach((component) => {
    // Use component name as the key, with a prefix to avoid collisions
    const componentKey = `Custom_${component.name.replace(/\s+/g, "_")}`
    customComponentConfigs[componentKey] = createCustomComponentConfig(component)
  })

  return {
    ...baseConfig,
    components: {
      ...baseConfig.components,
      ...customComponentConfigs,
    },
  }
}

