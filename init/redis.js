const Redis = require("ioredis");

// Create a Redis client and connect to Redis running in the Docker container
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost", // The Redis container is accessible via localhost on port 6379
  port: 6379, // Redis default port
  retryStrategy(times) {
    const delay = Math.min(times * 500, 2000); // Exponential backoff strategy with a max delay of 2 seconds
    console.log(`Redis connection lost. Retrying in ${delay}ms`);
    return delay; // Delay between retries
  },
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("close", () => {
  console.log("Redis connection closed");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

process.on("ECONNREFUSED", () => {
  console.log("Shutting down gracefully...");
  redis.quit(); // Close the Redis connection gracefully
  process.exit(0);
});

// Example: Set a key-value pair
redis
  .set("mykey", "Hello, Redis!")
  .then(() => {
    console.log("Key set!");
  })
  .catch((err) => {
    console.error("Error setting key:", err);
  });

// Example: Get a value by key
redis
  .get("mykey")
  .then((result) => {
    console.log("Stored value:", result); // Should print: "Hello, Redis!"
  })
  .catch((err) => {
    console.error("Error getting key:", err);
  });

module.exports = redis;
