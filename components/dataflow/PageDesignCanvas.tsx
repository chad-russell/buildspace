"use client"

import React from "react"
import { Puck, Data, Config } from "@measured/puck"
import "@measured/puck/puck.css"
import { puckConfig } from "@/lib/puck/config"
import { PuckMetadata } from "@/lib/puck/metadata"

interface PageDesignCanvasProps {
  data: Data
  metadata: PuckMetadata
  onChange: (data: Data) => void
  projectId: string
  // When this value changes, Puck is remounted. Parent should only
  // change it when external data is swapped in, not on each edit.
  resetKey?: string | number
  // Optional custom config (defaults to puckConfig if not provided)
  config?: Config
}

export function PageDesignCanvas({
  data,
  metadata,
  onChange,
  projectId,
  resetKey,
  config = puckConfig,
}: PageDesignCanvasProps) {
  const stateSchema = metadata.pageStateSchema || []

  // Include schema length in key so Puck remounts when schema length changes
  const stableKey = `${resetKey}-${stateSchema.length}`

  return (
    <div className="w-full h-full">
      <Puck
        key={stableKey}
        config={config}
        data={data}
        metadata={metadata}
        onChange={onChange}
      />
    </div>
  )
}

