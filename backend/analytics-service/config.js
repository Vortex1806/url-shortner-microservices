export const PORT = process.env.PORT || 3003;
export const DATABASE_URL = process.env.DATABASE_URL;
export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Analytics Pipeline Configuration
// const FLUSH_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
export const FLUSH_INTERVAL_MS = 10 * 1000; // 10 seconds
export const STREAM_NAME = "url_visits"; // The stream to listen to
export const HASH_KEY = "url_view_counts"; // The hash for batching counts
export const CONSUMER_GROUP = "analytics_group"; // The consumer group for the stream
