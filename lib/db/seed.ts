import { db } from "./index"
import { users } from "./schema"
import { eq } from "drizzle-orm"

export async function seedDatabase() {
  try {
    // Check if placeholder user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, "placeholder-user-id"))
      .limit(1)

    if (existingUser.length === 0) {
      // Create placeholder user for POC
      await db.insert(users).values({
        id: "placeholder-user-id",
        email: "demo@buildspace.com",
        name: "Demo User",
      })
      console.log("Created placeholder user")
    } else {
      console.log("Placeholder user already exists")
    }
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

