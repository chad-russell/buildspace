import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"
import { users } from "../lib/db/schema"

// Load environment variables from .env.local
config({ path: ".env.local" })

async function initDatabase() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.error("DATABASE_URL environment variable is not set")
    process.exit(1)
  }

  console.log("Connecting to database...")
  const migrationClient = postgres(connectionString, { max: 1 })
  const db = drizzle(migrationClient)

  try {
    console.log("Running migrations...")
    await migrate(db, { migrationsFolder: "./drizzle" })
    console.log("Migrations completed successfully!")

    console.log("Creating placeholder user...")
    await db.insert(users).values({
      id: "placeholder-user-id",
      email: "demo@buildspace.com",
      name: "Demo User",
    }).onConflictDoNothing()

    console.log("Database initialized successfully!")
  } catch (error) {
    console.error("Error initializing database:", error)
    process.exit(1)
  } finally {
    await migrationClient.end()
  }
}

initDatabase()

