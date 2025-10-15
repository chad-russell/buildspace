import { Config } from "@measured/puck"
import { TextComponent } from "./components/TextComponent"
import { HeadingComponent } from "./components/HeadingComponent"
import { ContainerComponent } from "./components/ContainerComponent"
import { DataDisplayComponent } from "./components/DataDisplayComponent"
import { InputComponent } from "./components/InputComponent"
import { ButtonComponent } from "./components/ButtonComponent"
import { CustomComponent } from "@/lib/db/schema"
import { buildDynamicPuckConfig } from "./custom-components"
import { ComponentTextBindingField } from "./fields/TextBindingField"
import { PropKeyField } from "./fields/PropKeyField"

// Base config with built-in components (for page editing)
export const basePuckConfig: Config = {
  components: {
    Text: TextComponent,
    Heading: HeadingComponent,
    Container: ContainerComponent,
    DataDisplay: DataDisplayComponent,
    Input: InputComponent,
    Button: ButtonComponent,
  },
}

// Config for designing custom components (component props only)
export const componentDesignConfig: Config = {
  components: {
    Text: {
      ...TextComponent,
      fields: {
        binding: ComponentTextBindingField,
      },
    },
    Heading: {
      ...HeadingComponent,
      fields: {
        text: HeadingComponent.fields?.text || { type: "text" },
        level: HeadingComponent.fields?.level || { type: "select", options: [] },
        bindingType: {
          type: "radio",
          options: [
            { label: "Static Text", value: "none" },
            { label: "Component Props", value: "componentProp" },
          ],
        },
        propKey: PropKeyField,
      },
    },
    Container: ContainerComponent,
    DataDisplay: DataDisplayComponent,
    Input: InputComponent,
    Button: ButtonComponent,
  },
}

// Default export for backwards compatibility
export const puckConfig: Config = basePuckConfig

/**
 * Builds a dynamic Puck config that includes custom components
 * Use this when you need to include user-created components
 */
export async function getPuckConfig(userId: string): Promise<Config> {
  // For now, we'll fetch custom components client-side
  // In a real app with SSR, you'd fetch from the database here
  return basePuckConfig
}

/**
 * Client-side helper to build dynamic config with custom components
 */
export function buildPuckConfigWithCustomComponents(
  customComponents: CustomComponent[]
): Config {
  return buildDynamicPuckConfig(basePuckConfig, customComponents)
}

export default puckConfig

