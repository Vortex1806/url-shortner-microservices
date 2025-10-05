import express from "express";
import { createClient } from "redis";
import { sql, eq } from "drizzle-orm";
import { urlsTable } from "./models/url.model.js"; // Ensure this schema file is present
import db from "./db/index.js";

// --- CONFIGURATION ---
const PORT = process.env.PORT || 3003;
const DATABASE_URL = process.env.DATABASE_URL;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Configuration for our analytics pipeline
// const FLUSH_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
const FLUSH_INTERVAL_MS = 10 * 1000;
const STREAM_NAME = "url_visits"; // The stream to listen to
const HASH_KEY = "url_view_counts"; // The hash for batching counts
const CONSUMER_GROUP = "analytics_group"; // The consumer group for the stream

// --- CLIENTS & INITIALIZATION ---
const app = express();

const redisClient = createClient({ url: REDIS_URL });

redisClient.on("error", (err) => console.error("Redis Client Error", err));

// --- ANALYTICS LOOPS ---

/**
 * The "Accountant" loop. Runs on a timer to safely flush batched counts from Redis to Postgres.
 * Uses a "claim-process-delete" pattern to ensure data is not lost if the service crashes mid-flush.
 */
async function flusherLoop() {
  const processingKey = `${HASH_KEY}_processing_${Date.now()}`;
  try {
    // 1. CLAIM: Atomically rename the hash to "claim" it for processing.
    // This is an instantaneous lock that prevents data loss.
    const entriesExist = await redisClient.exists(HASH_KEY);
    if (!entriesExist) {
      console.log(`[Flusher] No new counts to flush.`);
      return;
    }
    await redisClient.rename(HASH_KEY, processingKey);
    console.log(
      `[Flusher] Claimed counts for processing under key: ${processingKey}`
    );

    // 2. PROCESS: Calmly process the renamed hash without fear of new data arriving.
    const counts = await redisClient.hGetAll(processingKey);
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
      `[Flusher] Successfully flushed ${updatePromises.length} updates to DB.`
    );

    // 3. DELETE: Only after the database is successfully updated, delete the temporary hash.
    await redisClient.del(processingKey);
  } catch (error) {
    console.error("[Flusher] CRITICAL: Flush cycle failed.", error);
    // If this fails, the processingKey is left in Redis for manual inspection and recovery.
  }
}

/**
 * The "Collector" loop. Runs continuously to read new events from the Redis Stream
 * and increment counts in the Redis Hash.
 */
async function ingesterLoop() {
  let lastId = "0-0"; // Start reading from the beginning of the stream
  console.log("[Ingester] Starting event ingestion loop...");
  while (true) {
    try {
      // XREAD blocks until a message arrives or the timeout is reached.
      const response = await redisClient.xRead(
        { key: STREAM_NAME, id: lastId },
        { COUNT: 100, BLOCK: 5000 } // Process 100 messages at a time, block for 5 secs
      );

      if (response) {
        for (const stream of response) {
          for (const message of stream.messages) {
            // Increment the counter for this shortCode in our Redis Hash.
            await redisClient.hIncrBy(HASH_KEY, message.message.shortCode, 1);
            lastId = message.id; // Remember the last processed message ID
          }
        }
      }
    } catch (err) {
      console.error("[Ingester] Ingester loop error:", err);
      // Wait for a second before retrying to prevent a fast crash loop.
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

// --- SERVER & MAIN EXECUTION ---

// A simple health check endpoint to verify the service is alive and connected.
app.get("/healthz", (req, res) => {
  if (redisClient.isReady) {
    res.status(200).json({ status: "ok" });
  } else {
    res.status(503).json({ status: "error", details: "Redis not connected" });
  }
});

app.listen(PORT, async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis.");

    // Ensure the stream and consumer group exist before we start reading.
    // MKSTREAM creates the stream if it doesn't already exist.
    try {
      await redisClient.xGroupCreate(STREAM_NAME, CONSUMER_GROUP, "0", {
        MKSTREAM: true,
      });
    } catch (e) {
      console.log(
        `Consumer group "${CONSUMER_GROUP}" likely already exists, which is fine.`
      );
    }

    // Launch both loops to run concurrently in the background.
    ingesterLoop();
    setInterval(flusherLoop, FLUSH_INTERVAL_MS);

    console.log(`Analytics service listening on port ${PORT}`);
    console.log(
      `Flush cycle scheduled for every ${FLUSH_INTERVAL_MS / 1000} seconds.`
    );
  } catch (err) {
    console.error("Failed to start analytics service:", err);
    process.exit(1);
  }
});
