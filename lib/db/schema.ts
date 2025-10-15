import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core"
import { Data } from "@measured/puck"

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const dataFlows = pgTable("data_flows", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id").notNull().references(() => users.id),
  graphData: jsonb("graph_data").notNull().$type<{
    nodes: Array<{
      id: string
      type: string
      position: { x: number; y: number }
      data: Record<string, any>
    }>
    edges: Array<{
      id: string
      source: string
      target: string
      sourceHandle?: string
      targetHandle?: string
    }>
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export interface PropField {
  key: string
  type: "string" | "number" | "boolean" | "object"
  defaultValue: any
  label?: string
}

export const customComponents = pgTable("custom_components", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id").notNull().references(() => users.id),
  propsSchema: jsonb("props_schema").notNull().$type<PropField[]>(),
  puckData: jsonb("puck_data").notNull().$type<Data>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type DataFlow = typeof dataFlows.$inferSelect
export type NewDataFlow = typeof dataFlows.$inferInsert
export type CustomComponent = typeof customComponents.$inferSelect
export type NewCustomComponent = typeof customComponents.$inferInsert

