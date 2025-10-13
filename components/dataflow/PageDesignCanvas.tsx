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
  return (
    <div className="w-full h-full">
      <Puck
        config={puckConfig}
        data={data}
        metadata={metadata}
        onChange={onChange}
      />
    </div>
  )
}

