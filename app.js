const express = require("express");
const app = express();

const Redis = require("ioredis");

// Create a Redis client and connect to Redis running in the Docker container
const redis = new Redis({
  host: "localhost", // The Redis container is accessible via localhost on port 6379
  port: 6379, // Redis default port
  retryStrategy(times) {
    const delay = Math.min(times * 500, 2000); // Exponential backoff strategy with a max delay of 2 seconds
    console.log(`Redis connection lost. Retrying in ${delay}ms`);
    return delay; // Delay between retries
  },
});

app.get("/", (req, res) => {
  res.send(
    '<a href="/set-cookie">Set cookie</a><br/><a href="/pokemon/ditto">Fetch pokemon ditto</a>'
  );
});

app.get("/set-cookie", (req, res) => {
  res.cookie("user_session", "some_secure_value", {
    httpOnly: true, // Makes the cookie inaccessible to JavaScript
    secure: true, // Ensures the cookie is only sent over HTTPS
    maxAge: 3000, // Sets the cookie expiration time (in milliseconds)
  });

  res.send('<div>Cookie is set</div><a href="/">Home</a>');
});

app.get(`/pokemon/:pokemon`, async (req, res) => {
  const pokemon = req.params.pokemon;

  try {
    const cachedData = await redis.get(pokemon);
    if (cachedData) {
      console.log("Cache hit");

      return res.json(JSON.parse(cachedData));
    } else {
      console.log("Cache missed");

      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
      const data = await response.json();
      await redis.setex(pokemon, 3600, JSON.stringify(data));
      
      return res.json(data);
    }
  } catch {
    res.status(500).send("An error occurred");
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
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
