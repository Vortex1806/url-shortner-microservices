import express from "express";
import { PORT, FLUSH_INTERVAL_MS } from "./config.js";
import * as redisService from "./services/redis.service.js";
import * as urlService from "./services/url.service.js";

const app = express();

async function flusherLoop() {
  let processingData;
  try {
    processingData = await redisService.claimAndFetchCountsForProcessing();
    if (!processingData) {
      console.log(`[Flusher] No new counts to flush.`);
      return;
    }

    await urlService.batchUpdateVisitCounts(processingData.counts);

    await redisService.deleteProcessedKey(processingData.processingKey);
  } catch (error) {
    console.error("[Flusher] CRITICAL: Flush cycle failed.", error);
  }
}

app.get("/healthz", (req, res) => {
  if (redisService.redisClient.isReady) {
    res.status(200).json({ status: "ok", message: "Service is healthy" });
  } else {
    res.status(503).json({ status: "error", details: "Redis not connected" });
  }
});

async function startServer() {
  try {
    await redisService.connectRedis();
    await redisService.setupStreamAndGroup();
    redisService.startIngesterLoop();
    setInterval(flusherLoop, FLUSH_INTERVAL_MS);

    app.listen(PORT, () => {
      console.log(`Analytics service listening on port ${PORT}`);
      console.log(
        `Flush cycle scheduled for every ${FLUSH_INTERVAL_MS / 1000} seconds.`
      );
    });
  } catch (err) {
    console.error("Failed to start analytics service:", err);
    process.exit(1);
  }
}

startServer();
