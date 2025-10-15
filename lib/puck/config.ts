import { Config } from "@measured/puck"
import { TextComponent } from "./components/TextComponent"
import { HeadingComponent } from "./components/HeadingComponent"
import { ContainerComponent } from "./components/ContainerComponent"
import { DataDisplayComponent } from "./components/DataDisplayComponent"
import { InputComponent } from "./components/InputComponent"
import { ButtonComponent } from "./components/ButtonComponent"
import { CollectionComponent } from "./components/CollectionComponent"
import { CheckboxComponent } from "./components/CheckboxComponent"
import { CustomComponent } from "@/lib/db/schema"
import { buildDynamicPuckConfig } from "./custom-components"

// Base config with built-in components (for page editing)
export const basePuckConfig: Config = {
  components: {
    Text: TextComponent,
    Heading: HeadingComponent,
    Container: ContainerComponent,
    DataDisplay: DataDisplayComponent,
    Input: InputComponent,
    Button: ButtonComponent,
    Checkbox: CheckboxComponent,
    Collection: CollectionComponent,
  },
}

// Config for designing custom components
// Now uses the same unified @ syntax as the main editor!
// Components use @props.key to bind to component props defined in the schema
export const componentDesignConfig: Config = {
  components: {
    Text: TextComponent,
    Heading: HeadingComponent,
    Container: ContainerComponent,
    DataDisplay: DataDisplayComponent,
    Input: InputComponent,
    Button: ButtonComponent,
    Checkbox: CheckboxComponent,
    Collection: CollectionComponent,
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

