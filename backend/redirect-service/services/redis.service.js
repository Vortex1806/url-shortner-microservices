import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

const STREAM_NAME = "url_visits";

redisClient.on("error", (err) => console.log("Redis Client Error", err));

await redisClient.connect();

export async function getCachedUrl(shortCode) {
  try {
    return await redisClient.get(shortCode);
  } catch (err) {
    console.log("redis got error", err);
    return null;
  }
}

export async function setCachedUrl(shortCode, targetUrl, ttl = 3600) {
  try {
    await redisClient.setEx(shortCode, ttl, targetUrl);
  } catch (err) {
    console.log("redis got error", err);
  }
}

export async function publishVisitEvent(shortCode) {
  try {
    await redisClient.xAdd(STREAM_NAME, "*", { shortCode });
    console.log(`[Event Published] shortCode: ${shortCode}`);
  } catch (error) {
    console.error(
      `CRITICAL: Failed to publish visit event for ${shortCode}`,
      error
    );
  }
}

export default redisClient;
