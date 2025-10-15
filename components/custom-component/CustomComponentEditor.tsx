"use client"

import React, { useState, useEffect, useRef } from "react"
import { Data, Render } from "@measured/puck"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { PropsSchemaEditor } from "./PropsSchemaEditor"
import { PageDesignCanvas } from "@/components/dataflow/PageDesignCanvas"
import { componentDesignConfig } from "@/lib/puck/config"
import { PropField } from "@/lib/db/schema"
import { createComponentPropsMetadata } from "@/lib/puck/metadata"
import "@measured/puck/puck.css"

interface CustomComponentEditorProps {
  componentId: string | null
  initialName?: string
  initialPropsSchema?: PropField[]
  initialPuckData?: Data
}

const defaultPuckData: Data = {
  content: [],
  root: { props: {} },
}

export function CustomComponentEditor({
  componentId,
  initialName = "",
  initialPropsSchema = [],
  initialPuckData = defaultPuckData,
}: CustomComponentEditorProps) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [propsSchema, setPropsSchema] = useState<PropField[]>(initialPropsSchema)
  const [puckData, setPuckData] = useState<Data>(initialPuckData)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (!isInitialMount.current) {
      setHasChanges(true)
    }
    isInitialMount.current = false
  }, [name, propsSchema, puckData])

  useEffect(() => {
    setName(initialName)
    setPropsSchema(initialPropsSchema)
    setPuckData(initialPuckData)
    setResetKey((k) => k + 1)
    isInitialMount.current = true
    setHasChanges(false)
  }, [componentId, initialName, initialPropsSchema, initialPuckData])

  const handleBack = () => {
    if (hasChanges) {
      const confirm = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      )
      if (!confirm) return
    }
    router.push("/build")
  }

  const handlePuckChange = (newData: Data) => {
    setPuckData(newData)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Component name is required")
      return
    }

    setIsSaving(true)
    try {
      const method = componentId ? "PUT" : "POST"
      const url = componentId
        ? `/api/custom-components/${componentId}`
        : "/api/custom-components"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          userId: "placeholder-user-id", // In real app, get from auth
          propsSchema,
          puckData,
        }),
      })

      if (response.ok) {
        const saved = await response.json()
        setHasChanges(false)
        
        // If this was a new component, navigate to its edit page
        if (!componentId) {
          router.push(`/build/custom-components/${saved.id}`)
        }
      } else {
        console.error("Failed to save component")
        alert("Failed to save component")
      }
    } catch (error) {
      console.error("Error saving component:", error)
      alert("Error saving component")
    } finally {
      setIsSaving(false)
    }
  }

  const handleTogglePreview = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  // Create mock props for preview based on schema
  const mockProps = propsSchema.reduce((acc, prop) => {
    acc[prop.key] = prop.defaultValue
    return acc
  }, {} as Record<string, any>)

  // Create metadata with mock props
  const metadata = {
    markedInputs: {},
    componentProps: mockProps,
  }

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="h-14 border-b flex items-center justify-between px-4 bg-white">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex items-center gap-3">
            <Label htmlFor="component-name" className="text-sm">
              Name:
            </Label>
            <Input
              id="component-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-64"
              placeholder="Component name"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-xs text-orange-600">Unsaved changes</span>
          )}
          {isSaving && <span className="text-xs text-gray-500">Saving...</span>}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Component
          </Button>
          <Button
            variant={isPreviewMode ? "default" : "outline"}
            size="sm"
            onClick={handleTogglePreview}
          >
            {isPreviewMode ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Exit Preview
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {isPreviewMode ? (
          /* Preview mode - full-screen preview with mock props */
          <div className="w-full h-full overflow-auto bg-white p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">
                  Preview Mode
                </h3>
                <p className="text-xs text-blue-700">
                  Showing component with default prop values:
                </p>
                <pre className="text-xs text-blue-900 mt-2 bg-white p-2 rounded">
                  {JSON.stringify(mockProps, null, 2)}
                </pre>
              </div>
              <Render config={componentDesignConfig} data={puckData} metadata={metadata} />
            </div>
          </div>
        ) : (
          /* Edit mode - Puck editor with props schema sidebar */
          <>
            <div className="w-80 border-r bg-gray-50 overflow-y-auto p-4">
              <PropsSchemaEditor
                propsSchema={propsSchema}
                onChange={setPropsSchema}
              />
            </div>
            <div className="flex-1">
              <PageDesignCanvas
                data={puckData}
                metadata={metadata}
                onChange={handlePuckChange}
                projectId=""
                resetKey={resetKey}
                config={componentDesignConfig}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

