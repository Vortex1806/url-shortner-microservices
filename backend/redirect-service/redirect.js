import express from "express";
import { createClient } from "redis";
import db from "./db/index.js";
import { urlsTable } from "./models/url.model.js";
import { eq } from "drizzle-orm";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

const STREAM_NAME = "url_visits";

redisClient.on("error", (err) => console.log("Redis Client Error", err));
await redisClient.connect();

const app = express();

async function publishVisitEvent(shortCode) {
  try {
    const eventData = { shortCode };
    await redisClient.xAdd(STREAM_NAME, "*", eventData);
    console.log(`[Event Published] shortCode: ${shortCode}`);
  } catch (error) {
    console.error(
      `CRITICAL: Failed to publish visit event for ${shortCode}`,
      error
    );
    // In a production system, you would add an alert here.
  }
}

app.get("/:shortCode", async (req, res) => {
  const code = req.params.shortCode;

  try {
    const cachedUrl = await redisClient.get(code);
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

    await redisClient.setEx(code, 3600, result.targetUrl);
    publishVisitEvent(code);
    return res.redirect(301, result.targetUrl);
  } catch (error) {
    console.error("Error during redirection:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Redirect service listening on port ${PORT}`);
});
