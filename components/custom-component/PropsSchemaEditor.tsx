"use client"

import React, { useState } from "react"
import { PropField } from "@/lib/db/schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Trash2, Plus } from "lucide-react"

interface PropsSchemaEditorProps {
  propsSchema: PropField[]
  onChange: (schema: PropField[]) => void
}

export function PropsSchemaEditor({
  propsSchema,
  onChange,
}: PropsSchemaEditorProps) {
  const [editingProp, setEditingProp] = useState<PropField | null>(null)
  const [newPropKey, setNewPropKey] = useState("")
  const [newPropType, setNewPropType] = useState<PropField["type"]>("string")
  const [newPropLabel, setNewPropLabel] = useState("")
  const [newPropDefault, setNewPropDefault] = useState("")

  const handleAddProp = () => {
    if (!newPropKey.trim()) {
      alert("Prop key is required")
      return
    }

    // Check for duplicate keys
    if (propsSchema.some((p) => p.key === newPropKey)) {
      alert("A prop with this key already exists")
      return
    }

    // Parse default value based on type
    let defaultValue: any = newPropDefault
    try {
      if (newPropType === "number") {
        defaultValue = newPropDefault ? parseFloat(newPropDefault) : 0
      } else if (newPropType === "boolean") {
        defaultValue = newPropDefault === "true"
      } else if (newPropType === "object") {
        defaultValue = newPropDefault ? JSON.parse(newPropDefault) : {}
      }
    } catch (error) {
      alert("Invalid default value format")
      return
    }

    const newProp: PropField = {
      key: newPropKey,
      type: newPropType,
      defaultValue,
      label: newPropLabel || newPropKey,
    }

    onChange([...propsSchema, newProp])

    // Reset form
    setNewPropKey("")
    setNewPropType("string")
    setNewPropLabel("")
    setNewPropDefault("")
  }

  const handleRemoveProp = (key: string) => {
    onChange(propsSchema.filter((p) => p.key !== key))
  }

  const handleUpdateProp = (index: number, field: keyof PropField, value: any) => {
    const updated = [...propsSchema]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="border-b pb-4">
        <h3 className="text-sm font-semibold mb-3">Component Props</h3>
        
        {propsSchema.length === 0 ? (
          <p className="text-sm text-gray-500 mb-3">
            No props defined yet. Add props to make this component configurable.
          </p>
        ) : (
          <div className="space-y-2 mb-3">
            {propsSchema.map((prop, index) => (
              <div
                key={prop.key}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">
                      {prop.key}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                      {prop.type}
                    </span>
                  </div>
                  {prop.label && prop.label !== prop.key && (
                    <div className="text-xs text-gray-500 mt-1">
                      Label: {prop.label}
                    </div>
                  )}
                  <div className="text-xs text-gray-600 mt-1">
                    Default: {JSON.stringify(prop.defaultValue)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveProp(prop.key)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Add New Prop</h4>
        
        <div>
          <Label htmlFor="prop-key">Key *</Label>
          <Input
            id="prop-key"
            value={newPropKey}
            onChange={(e) => setNewPropKey(e.target.value)}
            placeholder="e.g., title, count, isVisible"
          />
        </div>

        <div>
          <Label htmlFor="prop-label">Label</Label>
          <Input
            id="prop-label"
            value={newPropLabel}
            onChange={(e) => setNewPropLabel(e.target.value)}
            placeholder="Optional display label"
          />
        </div>

        <div>
          <Label htmlFor="prop-type">Type *</Label>
          <select
            id="prop-type"
            value={newPropType}
            onChange={(e) => setNewPropType(e.target.value as PropField["type"])}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="object">Object</option>
          </select>
        </div>

        <div>
          <Label htmlFor="prop-default">Default Value</Label>
          <Input
            id="prop-default"
            value={newPropDefault}
            onChange={(e) => setNewPropDefault(e.target.value)}
            placeholder={
              newPropType === "object"
                ? "{}"
                : newPropType === "boolean"
                ? "true or false"
                : newPropType === "number"
                ? "0"
                : "Default text"
            }
          />
          {newPropType === "object" && (
            <p className="text-xs text-gray-500 mt-1">
              Must be valid JSON
            </p>
          )}
        </div>

        <Button onClick={handleAddProp} size="sm" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Prop
        </Button>
      </div>
    </div>
  )
}

