import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { customComponents } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

// GET /api/custom-components/[id] - Fetch single custom component
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const component = await db
      .select()
      .from(customComponents)
      .where(eq(customComponents.id, params.id))
      .limit(1)

    if (component.length === 0) {
      return NextResponse.json(
        { error: "Custom component not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(component[0])
  } catch (error) {
    console.error("Error fetching custom component:", error)
    return NextResponse.json(
      { error: "Failed to fetch custom component" },
      { status: 500 }
    )
  }
}

// PUT /api/custom-components/[id] - Update custom component
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, propsSchema, puckData } = body

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (name !== undefined) updateData.name = name
    if (propsSchema !== undefined) updateData.propsSchema = propsSchema
    if (puckData !== undefined) updateData.puckData = puckData

    const updated = await db
      .update(customComponents)
      .set(updateData)
      .where(eq(customComponents.id, params.id))
      .returning()

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Custom component not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(updated[0])
  } catch (error) {
    console.error("Error updating custom component:", error)
    return NextResponse.json(
      { error: "Failed to update custom component" },
      { status: 500 }
    )
  }
}

// DELETE /api/custom-components/[id] - Delete custom component
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await db
      .delete(customComponents)
      .where(eq(customComponents.id, params.id))
      .returning()

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Custom component not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting custom component:", error)
    return NextResponse.json(
      { error: "Failed to delete custom component" },
      { status: 500 }
    )
  }
}

