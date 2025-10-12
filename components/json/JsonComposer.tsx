"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Link2 } from "lucide-react"
import { isRef } from "@/lib/json/path"
import type { JsonPathRef } from "@/lib/types/dataflow"

export interface JsonComposerProps {
  value: unknown
  onChange?: (next: unknown) => void
  readOnly?: boolean
  // id of the node hosting this composer, used to create references
  ownerNodeId?: string
  onCreateReference?: (sourceNodeId: string, targetNodeId: string) => void
}

// Global state for hover highlighting
let hoveredPath: (string | number)[] | null = null
let hoveredNodeId: string | null = null

export function JsonComposer({ value, onChange, readOnly = false, ownerNodeId, onCreateReference }: JsonComposerProps) {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0)

  const handleChange = (newValue: unknown) => {
    if (onChange) {
      onChange(newValue)
    }
  }

  // Listen for hover events to trigger re-renders
  React.useEffect(() => {
    if (!ownerNodeId) return
    
    const handleHover = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail.nodeId === ownerNodeId) {
        hoveredNodeId = customEvent.detail.hovering ? ownerNodeId : null
        hoveredPath = customEvent.detail.hovering ? customEvent.detail.path : null
        forceUpdate()
      }
    }

    window.addEventListener('json-ref-hover', handleHover)
    return () => window.removeEventListener('json-ref-hover', handleHover)
  }, [ownerNodeId])

  return (
    <div className="font-mono text-sm leading-relaxed nopan nodrag">
      <JsonValue 
        value={value} 
        depth={0} 
        path={[]} 
        rootValue={value}
        onChange={handleChange}
        readOnly={readOnly}
        ownerNodeId={ownerNodeId}
        onCreateReference={onCreateReference}
      />
    </div>
  )
}

interface JsonValueProps {
  value: any
  depth: number
  path: (string | number)[]
  rootValue: any
  onChange: (newValue: unknown) => void
  readOnly: boolean
  parentIsArray?: boolean
  ownerNodeId?: string
  onCreateReference?: (sourceNodeId: string, targetNodeId: string) => void
}

// Helper to check if this path is being hovered
function isPathHovered(nodeId: string | undefined, path: (string | number)[]): boolean {
  if (!nodeId || !hoveredNodeId || !hoveredPath) return false
  if (nodeId !== hoveredNodeId) return false
  if (path.length !== hoveredPath.length) return false
  return path.every((seg, i) => seg === hoveredPath![i])
}

function JsonValue({ value, depth, path, rootValue, onChange, readOnly, parentIsArray = false, ownerNodeId, onCreateReference }: JsonValueProps) {
  const INDENT = 8
  const isHighlighted = isPathHovered(ownerNodeId, path)
  
  const convertType = (targetType: string) => {
    let newVal: any
    switch (targetType) {
      case "string":
        newVal = String(value ?? "")
        break
      case "number":
        newVal = typeof value === "number" ? value : 0
        break
      case "boolean":
        newVal = Boolean(value)
        break
      case "null":
        newVal = null
        break
      case "object":
        newVal = {}
        break
      case "array":
        newVal = []
        break
      default:
        return
    }
    
    // Update the root value at this path
    const newRoot = setValueAtPath(rootValue, path, newVal)
    onChange(newRoot)
  }

  const deleteItem = () => {
    // Delete this item from root
    const newRoot = deleteAtPath(rootValue, path)
    onChange(newRoot)
  }

  // Drag handling for any value (including objects/arrays) as source only
  const onDragStart = (e: React.DragEvent) => {
    const payload = { path, nodeId: ownerNodeId }
    e.dataTransfer.setData("application/x-json-path", JSON.stringify(payload))
    // helpful text preview
    try { e.dataTransfer.setData("text/plain", JSON.stringify(value)) } catch {}
  }

  const onDragOver = (e: React.DragEvent) => {
    // Only allow drop if this is a JSON path drag, not a node from sidebar
    const hasJsonPath = e.dataTransfer.types.includes("application/x-json-path")
    if (!hasJsonPath) return // Let it bubble up for node drops
    
    e.preventDefault()
  }

  const onDrop = (e: React.DragEvent) => {
    // Only handle JSON path drops
    const raw = e.dataTransfer.getData("application/x-json-path")
    if (!raw) return // Not a JSON path drop, ignore it
    
    e.preventDefault() // Prevent default only for JSON path drops
    e.stopPropagation() // Stop it from bubbling to canvas
    
    try {
      const { path: sourcePath, nodeId: sourceNodeId } = JSON.parse(raw)
      if (e.altKey) {
        // copy literal
        const sourceVal = getValueAtPath(rootValue, sourcePath)
        const newRoot = setValueAtPath(rootValue, path, sourceVal)
        onChange(newRoot)
      } else if (sourceNodeId && ownerNodeId) {
        const ref = { $ref: [{ id: sourceNodeId }, ...sourcePath] }
        const newRoot = setValueAtPath(rootValue, path, ref)
        onChange(newRoot)
        onCreateReference?.(sourceNodeId, ownerNodeId)
      }
    } catch {}
  }

  // Check if this is a reference object
  if (isRef(value)) {
    return <ReferenceChip
      reference={value}
      path={path}
      rootValue={rootValue}
      onChange={onChange}
      readOnly={readOnly}
      onDelete={parentIsArray ? deleteItem : undefined}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    />
  }

  // Primitive values with inline editing
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
    return <PrimitiveValue 
      value={value} 
      onChange={(newVal) => {
        const newRoot = setValueAtPath(rootValue, path, newVal)
        onChange(newRoot)
      }}
      onConvertType={convertType}
      onDelete={parentIsArray ? deleteItem : undefined}
      readOnly={readOnly}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      isHighlighted={isHighlighted}
    />
  }

  if (Array.isArray(value)) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    
    const addItem = () => {
      const newRoot = setValueAtPath(rootValue, path, [...value, null])
      onChange(newRoot)
    }

    return (
      <span>
        <span 
          className="text-slate-500 cursor-pointer hover:bg-slate-200 px-0.5 rounded"
          onClick={() => setIsCollapsed(!isCollapsed)}
          draggable
          onDragStart={onDragStart}
        >
          [
        </span>
        {isCollapsed ? (
          <span className="text-slate-400 italic">...</span>
        ) : (
          <div>
            {value.length === 0 && (
              <div className="text-slate-400 italic" style={{ paddingLeft: `${(depth + 1) * INDENT}px` }}>
                empty array
              </div>
            )}
            {value.map((item, idx) => (
              <div key={idx} style={{ paddingLeft: `${(depth + 1) * INDENT}px` }}>
                <JsonValue 
                  value={item} 
                  depth={depth + 1} 
                  path={[...path, idx]}
                  rootValue={rootValue}
                  onChange={onChange}
                  readOnly={readOnly}
                  parentIsArray={true}
                  ownerNodeId={ownerNodeId}
                  onCreateReference={onCreateReference}
                />
              </div>
            ))}
            <div style={{ paddingLeft: `${(depth + 1) * INDENT}px` }}>
              <button onClick={addItem} className="text-[11px] text-blue-600 hover:underline">+ Add item</button>
            </div>
          </div>
        )}
        <span className="text-slate-500">
          {isCollapsed ? "" : <span style={{ paddingLeft: `${depth * INDENT}px`, display: "block" }}>]</span>}
          {isCollapsed && "]"}
        </span>
      </span>
    )
  }

  if (typeof value === "object") {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const entries = Object.entries(value)
    
    const addField = () => {
      // find available key name
      const base = "key"
      let idx = 1
      let key = base
      while (key in (value || {})) {
        key = base + idx
        idx++
      }
      const newObj = { ...value, [key]: null }
      const newRoot = setValueAtPath(rootValue, path, newObj)
      onChange(newRoot)
    }

    return (
      <span>
        <span 
          className="text-slate-500 cursor-pointer hover:bg-slate-200 px-0.5 rounded"
          onClick={() => setIsCollapsed(!isCollapsed)}
          draggable
          onDragStart={onDragStart}
        >
          {"{"}
        </span>
        {isCollapsed ? (
          <span className="text-slate-400 italic">...</span>
        ) : (
          <div>
            {entries.length === 0 && (
              <div className="text-slate-400 italic" style={{ paddingLeft: `${(depth + 1) * INDENT}px` }}>
                empty object
              </div>
            )}
            {entries.map(([key, val], idx) => (
              <div key={key} style={{ paddingLeft: `${(depth + 1) * INDENT}px` }}>
                <ObjectKey
                  keyName={key}
                  onRename={(newKey) => {
                    const newObj = { ...value }
                    delete newObj[key]
                    newObj[newKey] = val
                    const newRoot = setValueAtPath(rootValue, path, newObj)
                    onChange(newRoot)
                  }}
                  onDelete={() => {
                    const newObj = { ...value }
                    delete newObj[key]
                    const newRoot = setValueAtPath(rootValue, path, newObj)
                    onChange(newRoot)
                  }}
                  readOnly={readOnly}
                />
                <span className="text-slate-500">: </span>
                <JsonValue 
                  value={val} 
                  depth={depth + 1} 
                  path={[...path, key]}
                  rootValue={rootValue}
                  onChange={onChange}
                  readOnly={readOnly}
                  ownerNodeId={ownerNodeId}
                  onCreateReference={onCreateReference}
                />
              </div>
            ))}
            <div style={{ paddingLeft: `${(depth + 1) * INDENT}px` }}>
              <button onClick={addField} className="text-[11px] text-blue-600 hover:underline">+ Add field</button>
            </div>
          </div>
        )}
        <span className="text-slate-500">
          {isCollapsed ? "" : <span style={{ paddingLeft: `${depth * INDENT}px`, display: "block" }}>{"}"}</span>}
          {isCollapsed && "}"}
        </span>
      </span>
    )
  }

  return <span className="text-slate-400">undefined</span>
}

// Primitive value editor with inline editing
interface PrimitiveValueProps {
  value: string | number | boolean | null
  onChange: (newVal: any) => void
  onConvertType: (type: string) => void
  onDelete?: () => void
  readOnly: boolean
  isHighlighted?: boolean
}

function PrimitiveValue({ value, onChange, onConvertType, onDelete, readOnly, isHighlighted, ...dragProps }: PrimitiveValueProps & React.HTMLAttributes<HTMLSpanElement>) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState("")

  const handleClick = () => {
    if (readOnly) return
    
    if (typeof value === "boolean") {
      // Toggle boolean on click
      onChange(!value)
    } else if (typeof value === "string" || typeof value === "number") {
      // Enter edit mode
      setEditValue(String(value))
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    setIsEditing(false)
    if (typeof value === "number") {
      const num = parseFloat(editValue)
      if (!isNaN(num)) {
        onChange(num)
      }
    } else {
      onChange(editValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setIsEditing(false)
    }
  }

  const menu = (
    <ContextMenuContent>
      <ContextMenuItem onClick={() => onConvertType("string")}>✏️ "abc"</ContextMenuItem>
      <ContextMenuItem onClick={() => onConvertType("number")}>✏️ 123</ContextMenuItem>
      <ContextMenuItem onClick={() => onConvertType("boolean")}>✏️ ☑</ContextMenuItem>
      <ContextMenuItem onClick={() => onConvertType("null")}>✏️ null</ContextMenuItem>
      <ContextMenuItem onClick={() => onConvertType("object")}>✏️ {"{}"}</ContextMenuItem>
      <ContextMenuItem onClick={() => onConvertType("array")}>✏️ []</ContextMenuItem>
      {onDelete && <ContextMenuItem onClick={onDelete}>🗑️ Delete</ContextMenuItem>}
    </ContextMenuContent>
  )

  let display: React.ReactNode

  if (isEditing && (typeof value === "string" || typeof value === "number")) {
    const inputType = typeof value === "number" ? "number" : "text"
    return (
      <input
        autoFocus
        type={inputType}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="bg-white border border-blue-400 rounded px-1 outline-none"
        style={{ width: `${Math.max(editValue.length * 8 + 16, 40)}px` }}
      />
    )
  }

  if (value === null) {
    display = (
      <span className={cn(
        "text-purple-600",
        isHighlighted && "bg-yellow-200 ring-2 ring-yellow-400 px-1 rounded font-bold"
      )}>
        null
      </span>
    )
  } else if (typeof value === "boolean") {
    display = (
      <span className={cn(
        "text-orange-600 cursor-pointer hover:bg-orange-50 px-1 rounded",
        isHighlighted && "bg-yellow-200 ring-2 ring-yellow-400 font-bold"
      )}>
        {value ? "true" : "false"}
      </span>
    )
  } else if (typeof value === "number") {
    display = (
      <span className={cn(
        "text-blue-600 cursor-pointer hover:bg-blue-50 px-1 rounded",
        isHighlighted && "bg-yellow-200 ring-2 ring-yellow-400 font-bold"
      )}>
        {value}
      </span>
    )
  } else {
    display = (
      <span className={cn(
        "text-green-600 cursor-pointer hover:bg-green-50 px-1 rounded",
        isHighlighted && "bg-yellow-200 ring-2 ring-yellow-400 font-bold"
      )}>
        "{value}"
      </span>
    )
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <span onClick={handleClick} {...dragProps}>
          {display}
        </span>
      </ContextMenuTrigger>
      {menu}
    </ContextMenu>
  )
}

// Object key editor with inline renaming
interface ObjectKeyProps {
  keyName: string
  onRename: (newKey: string) => void
  onDelete: () => void
  readOnly: boolean
}

function ObjectKey({ keyName, onRename, onDelete, readOnly }: ObjectKeyProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(keyName)

  const handleClick = () => {
    if (readOnly) return
    setEditValue(keyName)
    setIsEditing(true)
  }

  const handleSave = () => {
    setIsEditing(false)
    if (editValue && editValue !== keyName) {
      onRename(editValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <input
        autoFocus
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="bg-white border border-cyan-400 rounded px-1 outline-none text-cyan-700"
        style={{ width: `${Math.max(editValue.length * 8 + 16, 60)}px` }}
      />
    )
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <span 
          className="text-cyan-700 cursor-pointer hover:bg-cyan-50 px-1 rounded"
          onClick={handleClick}
        >
          {keyName}
        </span>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleClick}>✏️ Rename</ContextMenuItem>
        <ContextMenuItem onClick={onDelete}>🗑️ Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

// Reference chip component
interface ReferenceChipProps {
  reference: { $ref: JsonPathRef }
  path: (string | number)[]
  rootValue: any
  onChange: (newValue: unknown) => void
  readOnly: boolean
  onDelete?: () => void
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
}

function ReferenceChip({ reference, path, rootValue, onChange, readOnly, onDelete, ...dragProps }: ReferenceChipProps) {
  const [isHovered, setIsHovered] = useState(false)
  const ref = reference.$ref
  const sourceNodeId = ref[0]?.id
  const refPath = ref.slice(1)

  // Format the reference path nicely
  const formatPath = () => {
    const parts = refPath.map((seg) => 
      typeof seg === "number" ? `[${seg}]` : `.${seg}`
    ).join("")
    return `@${sourceNodeId}${parts}`
  }

  const convertToLiteral = () => {
    // For now, just convert to null - would need access to context to resolve
    const newRoot = setValueAtPath(rootValue, path, null)
    onChange(newRoot)
  }

  // Emit hover event to highlight source node and specific path
  React.useEffect(() => {
    if (isHovered && sourceNodeId) {
      // Dispatch custom event that the canvas can listen to
      window.dispatchEvent(new CustomEvent('json-ref-hover', { 
        detail: { nodeId: sourceNodeId, hovering: true, path: refPath }
      }))
    }
    return () => {
      if (sourceNodeId) {
        window.dispatchEvent(new CustomEvent('json-ref-hover', { 
          detail: { nodeId: sourceNodeId, hovering: false, path: null }
        }))
      }
    }
  }, [isHovered, sourceNodeId, refPath])

  const chip = (
    <span 
      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-medium cursor-pointer hover:bg-blue-200 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`Reference to ${formatPath()}`}
      {...dragProps}
    >
      <Link2 className="w-3 h-3" />
      <span>{formatPath()}</span>
    </span>
  )

  if (readOnly) {
    return chip
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {chip}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={convertToLiteral}>
          🔗→📄 Convert to literal
        </ContextMenuItem>
        {onDelete && <ContextMenuItem onClick={onDelete}>🗑️ Delete</ContextMenuItem>}
      </ContextMenuContent>
    </ContextMenu>
  )
}

// Helper function to set value at path immutably
function setValueAtPath(root: any, path: (string | number)[], value: any): any {
  if (path.length === 0) {
    return value
  }

  const [head, ...tail] = path
  
  if (Array.isArray(root)) {
    const newArray = [...root]
    newArray[head as number] = setValueAtPath(root[head as number], tail, value)
    return newArray
  } else if (typeof root === "object" && root !== null) {
    return {
      ...root,
      [head]: setValueAtPath(root[head as string], tail, value),
    }
  }
  
  return root
}

// Helper to read value from a path in a plain JS object
function getValueAtPath(root: any, path: (string | number)[]): any {
  let cur = root
  for (const seg of path) {
    if (cur == null) return undefined
    cur = cur[seg as any]
  }
  return cur
}

// Helper function to delete at path immutably
function deleteAtPath(root: any, path: (string | number)[]): any {
  if (path.length === 0) {
    return undefined
  }
  
  if (path.length === 1) {
    const [key] = path
    if (Array.isArray(root)) {
      const newArray = [...root]
      newArray.splice(key as number, 1)
      return newArray
    } else if (typeof root === "object" && root !== null) {
      const { [key]: _, ...rest } = root
      return rest
    }
  }
  
  const [head, ...tail] = path
  
  if (Array.isArray(root)) {
    const newArray = [...root]
    newArray[head as number] = deleteAtPath(root[head as number], tail)
    return newArray
  } else if (typeof root === "object" && root !== null) {
    return {
      ...root,
      [head]: deleteAtPath(root[head as string], tail),
    }
  }
  
  return root
}

export default JsonComposer
