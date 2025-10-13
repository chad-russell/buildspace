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
}

export function PageDesignCanvas({
  data,
  metadata,
  onChange,
}: PageDesignCanvasProps) {
  // Force Puck to remount when data changes externally
  const dataKey = JSON.stringify(data.content)
  
  return (
    <div className="w-full h-full">
      <Puck
        key={dataKey}
        config={puckConfig}
        data={data}
        metadata={metadata}
        onChange={onChange}
      />
    </div>
  )
}

