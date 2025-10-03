import express from "express";
import { createClient } from "redis";
import db from "./db/index.js";
import { urlsTable } from "./models/url.model.js";
import { eq } from "drizzle-orm";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
await redisClient.connect();

const app = express();

app.get("/:shortCode", async (req, res) => {
  const code = req.params.shortCode;

  try {
    // 1. Check Redis Cache
    const cachedUrl = await redisClient.get(code);
    if (cachedUrl) {
      console.log(`Cache hit for: ${code}`);
      return res.redirect(301, cachedUrl);
    }

    // 2. If not in cache, query the database
    console.log(`Cache miss for: ${code}. Querying DB.`);
    const [result] = await db
      .select({ targetUrl: urlsTable.targetUrl })
      .from(urlsTable)
      .where(eq(urlsTable.shortCode, code));

    if (!result) {
      return res.status(404).json({ error: "Short URL does not exist" });
    }

    // 3. Store in Redis for future requests (e.g., cache for 1 hour)
    await redisClient.setEx(code, 3600, result.targetUrl);

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
