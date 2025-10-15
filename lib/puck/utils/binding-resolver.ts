import { MarkedInput, resolveDataPath } from "../metadata"

export interface BindingContext {
  markedInputs?: Record<string, MarkedInput>
  pageState?: Record<string, any>
  componentProps?: Record<string, any>
}

/**
 * Resolves a binding string to its actual value
 * 
 * Syntax:
 * - Static text: "Hello world"
 * - Page state: "@pageState.username"
 * - Component props (entire item): "@props"
 * - Component props (specific field): "@props.title"
 * 
 * @param value The binding string
 * @param context The context containing data sources
 * @returns The resolved value or undefined
 */
export function resolveBinding(value: string | undefined, context: BindingContext): any {
  // Handle undefined/null
  if (!value) return value

  // Static text (no @ prefix)
  if (!value.startsWith('@')) {
    return value
  }

  // Dynamic binding with @ prefix
  if (value.startsWith('@inputs.')) {
    const path = value.slice('@inputs.'.length)
    if (!context.markedInputs) return undefined
    return resolveDataPath(context.markedInputs, path)
  }

  if (value.startsWith('@pageState.')) {
    const key = value.slice('@pageState.'.length)
    return context.pageState?.[key]
  }

  // @props - return the entire componentProps object (useful for arrays of primitives)
  if (value === '@props') {
    return context.componentProps
  }

  if (value.startsWith('@props.')) {
    const key = value.slice('@props.'.length)
    return context.componentProps?.[key]
  }

  // Unknown @ syntax - return as-is
  return value
}

/**
 * Parses a binding string to determine its type
 * Useful for showing hints/validation in the UI
 */
export function parseBindingType(value: string | undefined): 
  | { type: 'static' }
  | { type: 'inputs'; path: string }
  | { type: 'pageState'; key: string }
  | { type: 'props'; key: string }
  | { type: 'unknown'; raw: string } 
{
  if (!value || !value.startsWith('@')) {
    return { type: 'static' }
  }

  if (value.startsWith('@inputs.')) {
    return { type: 'inputs', path: value.slice('@inputs.'.length) }
  }

  if (value.startsWith('@pageState.')) {
    return { type: 'pageState', key: value.slice('@pageState.'.length) }
  }

  if (value === '@props') {
    return { type: 'props', key: '' }
  }

  if (value.startsWith('@props.')) {
    return { type: 'props', key: value.slice('@props.'.length) }
  }

  return { type: 'unknown', raw: value }
}
