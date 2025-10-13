"use client"

import React from "react"
import { Puck, Data } from "@measured/puck"
import "@measured/puck/puck.css"
import { puckConfig } from "@/lib/puck/config"
import { PuckMetadata } from "@/lib/puck/metadata"

interface PageDesignCanvasProps {
  data: Data
  metadata: PuckMetadata
  onChange: (data: Data) => void
  // When this value changes, Puck is remounted. Parent should only
  // change it when external data is swapped in, not on each edit.
  resetKey?: string | number
}

export function PageDesignCanvas({
  data,
  metadata,
  onChange,
  resetKey,
}: PageDesignCanvasProps) {
  return (
    <div className="w-full h-full">
      <Puck
        key={resetKey}
        config={puckConfig}
        data={data}
        metadata={metadata}
        onChange={onChange}
      />
    </div>
  )
}

