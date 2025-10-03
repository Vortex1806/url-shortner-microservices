import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 55 }).notNull(),
  lastName: varchar("last_name", { length: 55 }),
  email: varchar("email", { length: 255 }).notNull().unique(),

  password: text("password").notNull(),
  salt: text("salt").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
