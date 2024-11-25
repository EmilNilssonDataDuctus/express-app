const express = require("express");
const router = express.Router();

const mwCacheFlagger = require("../../middleware/cacheFlagger");
const redis = require("../../init/redis");
const spritesOnlyDefault = require("./filters");

router.get(`/:pokemon`, mwCacheFlagger, async (req, res) => {
  const pokemon = req.params.pokemon;
  console.log(pokemon);
  const { useCache } = req;

  try {
    const cachedData = useCache ? await redis.get(pokemon) : null;

    if (cachedData) {
      console.time("Cache Hit");
      const resParsedFromCache = JSON.parse(cachedData);
      console.timeEnd("Cache Hit");

      return res.json(resParsedFromCache);
    } else {
      console.time("Cache Miss");
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemon}`
      );
      const data = await response.json();
      await redis.setex(pokemon, 3600, JSON.stringify(data));
      console.timeEnd("Cache Miss");

      return res.json(data);
    }
  } catch {
    return res.status(500).send("An error occurred");
  }
});

router.get(`/sprite/:pokemon`, mwCacheFlagger, async (req, res) => {
  const pokemonNo = req.params.pokemon;
  const { useCache } = req;
  const cacheKey = `${pokemonNo}:sprites`;

  try {
    const cachedData = useCache ? await redis.get(cacheKey) : null;

    if (cachedData) {
      console.time("Cache Hit");
      const resParsedFromCache = JSON.parse(cachedData);
      console.timeEnd("Cache Hit");

      return res.json(resParsedFromCache);
    } else {
      console.time("Cache Miss");
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonNo}`
      );
      const data = await response.json();

      const sprites = data.sprites;

      const filteredSprites = spritesOnlyDefault(sprites);

      await redis.setex(cacheKey, 3600, JSON.stringify(filteredSprites));
      console.timeEnd("Cache Miss");

      return res.json(filteredSprites);
    }
  } catch {
    res.status(500).send("An error occurred");
  }
});

module.exports = router;
