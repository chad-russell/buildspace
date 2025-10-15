import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { customComponents } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

// GET /api/custom-components - List all custom components
export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get userId from session/auth
    // For now, we'll use a query parameter or default user
    const userId = request.nextUrl.searchParams.get("userId") || "placeholder-user-id"
    
    const components = await db
      .select()
      .from(customComponents)
      .where(eq(customComponents.userId, userId))
      .orderBy(customComponents.createdAt)
    
    return NextResponse.json(components)
  } catch (error) {
    console.error("Error fetching custom components:", error)
    return NextResponse.json(
      { error: "Failed to fetch custom components" },
      { status: 500 }
    )
  }
}

// POST /api/custom-components - Create new custom component
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, userId, propsSchema, puckData } = body

    if (!name || !userId) {
      return NextResponse.json(
        { error: "Name and userId are required" },
        { status: 400 }
      )
    }

    // Initialize with empty props schema and puck data if not provided
    const initialPropsSchema = propsSchema || []
    const initialPuckData = puckData || { content: [], root: { props: {} } }

    const newComponent = await db
      .insert(customComponents)
      .values({
        name,
        userId,
        propsSchema: initialPropsSchema,
        puckData: initialPuckData,
      })
      .returning()

    return NextResponse.json(newComponent[0], { status: 201 })
  } catch (error) {
    console.error("Error creating custom component:", error)
    return NextResponse.json(
      { error: "Failed to create custom component" },
      { status: 500 }
    )
  }
}

