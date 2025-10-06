import db from "../db/index.js";
import { urlsTable } from "../models/url.model.js";
import { eq } from "drizzle-orm";
import {
  getCachedUrl,
  setCachedUrl,
  publishVisitEvent,
} from "./redis.service.js";

export async function handleShortUrlRedirect(code, res) {
  try {
    const cachedUrl = await getCachedUrl(code);
    if (cachedUrl) {
      console.log(`Cache hit for: ${code}`);
      publishVisitEvent(code);
      return res.redirect(301, cachedUrl);
    }

    console.log(`Cache miss for: ${code}. Querying DB.`);
    const [result] = await db
      .select({ targetUrl: urlsTable.targetUrl })
      .from(urlsTable)
      .where(eq(urlsTable.shortCode, code));

    if (!result) {
      return res.status(404).json({ error: "Short URL does not exist" });
    }

    await setCachedUrl(code, result.targetUrl);
    publishVisitEvent(code);

    return res.redirect(302, result.targetUrl);
  } catch (error) {
    console.error("Error during redirection:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
