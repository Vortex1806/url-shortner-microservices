import { createClient } from "redis";
import { REDIS_URL, STREAM_NAME, HASH_KEY, CONSUMER_GROUP } from "../config.js";

export const redisClient = createClient({ url: REDIS_URL });

export async function connectRedis() {
  redisClient.on("error", (err) => console.error("Redis Client Error", err));
  await redisClient.connect();
  console.log("Connected to Redis.");
}

export async function setupStreamAndGroup() {
  try {
    await redisClient.xGroupCreate(STREAM_NAME, CONSUMER_GROUP, "0", {
      MKSTREAM: true,
    });
    console.log(
      `[Redis Service] Stream "${STREAM_NAME}" and group "${CONSUMER_GROUP}" are ready.`
    );
  } catch (e) {
    console.log(
      `[Redis Service] Consumer group "${CONSUMER_GROUP}" already exists.`
    );
  }
}

export async function startIngesterLoop() {
  let lastId = "0-0"; // Start from the beginning
  console.log("[Ingester] Starting event ingestion loop...");
  while (true) {
    try {
      const response = await redisClient.xRead(
        { key: STREAM_NAME, id: lastId },
        { COUNT: 100, BLOCK: 5000 }
      );

      if (response) {
        for (const stream of response) {
          for (const message of stream.messages) {
            await redisClient.hIncrBy(HASH_KEY, message.message.shortCode, 1);
            lastId = message.id;
          }
        }
      }
    } catch (err) {
      console.error("[Ingester] Loop error:", err);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

export async function claimAndFetchCountsForProcessing() {
  const entriesExist = await redisClient.exists(HASH_KEY);
  if (!entriesExist) {
    return null;
  }

  const processingKey = `${HASH_KEY}_processing_${Date.now()}`;
  await redisClient.rename(HASH_KEY, processingKey);
  const counts = await redisClient.hGetAll(processingKey);

  console.log(
    `[Redis Service] Claimed counts under temporary key: ${processingKey}`
  );
  return { processingKey, counts };
}

export async function deleteProcessedKey(key) {
  await redisClient.del(key);
  console.log(`[Redis Service] Cleaned up processed key: ${key}`);
}
