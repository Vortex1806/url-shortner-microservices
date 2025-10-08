import { sql, eq } from "drizzle-orm";
import db from "../db/index.js";
import { urlsTable } from "../models/url.model.js";

export async function batchUpdateVisitCounts(counts) {
  if (Object.keys(counts).length === 0) {
    return;
  }

  console.log(
    `[DB Service] Preparing to flush ${Object.keys(counts).length} updates.`
  );

  const updatePromises = Object.entries(counts).map(([shortCode, count]) =>
    db
      .update(urlsTable)
      .set({
        visitCount: sql`${urlsTable.visitCount} + ${parseInt(count, 10)}`,
      })
      .where(eq(urlsTable.shortCode, shortCode))
  );

  await Promise.all(updatePromises);

  console.log(
    `[DB Service] Successfully flushed ${updatePromises.length} updates to the database.`
  );
}
