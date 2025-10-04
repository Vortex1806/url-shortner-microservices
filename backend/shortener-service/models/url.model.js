import {
  pgTable,
  timestamp,
  text,
  integer,
  varchar,
  uuid,
} from "drizzle-orm/pg-core";
import { userTable } from "./user.model.js";

export const urlsTable = pgTable("urls", {
  id: uuid("id").primaryKey().defaultRandom(),
  shortCode: varchar("short_code", { length: 155 }).notNull().unique(),
  targetUrl: text("target_url").notNull(),
  userId: uuid("user_id")
    .references(() => userTable.id)
    .notNull(),
  visitCount: integer("visit_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
