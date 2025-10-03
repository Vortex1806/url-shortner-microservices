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
