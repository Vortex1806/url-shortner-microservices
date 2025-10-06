import db from "../db/index.js";
import { urlsTable } from "../models/url.model.js";

export async function createNewShortUrl(shortCode, targetUrl, userId) {
  const [result] = await db
    .insert(urlsTable)
    .values({
      shortCode,
      targetUrl,
      userId,
    })
    .returning({
      id: urlsTable.id,
      shortCode: urlsTable.shortCode,
      targetUrl: urlsTable.targetUrl,
    });
  return result;
}

export async function getAllUserCodes(userId) {
  const result = await db
    .select()
    .from(urlsTable)
    .where(eq(urlsTable.userId, userId));
  return result;
}

export async function deleteShortUrl(id, userId) {
  const result = db
    .delete(urlsTable)
    .where(and(eq(urlsTable.id, id), eq(urlsTable.userId, userId)));
  return result;
}
