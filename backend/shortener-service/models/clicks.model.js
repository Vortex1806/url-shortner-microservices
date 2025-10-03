import { pgTable, uuid, timestamp, text } from "drizzle-orm/pg-core";
import { urlsTable } from "./url.model.js";

export const clicksTable = pgTable("clicks", {
  id: uuid("id").primaryKey().defaultRandom(),
  urlId: uuid("url_id")
    .references(() => urlsTable.id)
    .notNull(),
  city: text("city"),
  device: text("device"),
  country: text("country"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
