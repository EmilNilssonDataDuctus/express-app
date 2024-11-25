const express = require("express");
const router = express.Router();

const mwCacheFlagger = require("../../middleware/cacheFlagger");
const redis = require("../../init/redis");
const spritesOnlyDefault = require("./filters");

const getDataFrom3rdPartySource = async (pokemonNo) => {
  console.time(
    "Cache layer 1 Miss\nFetching from public datasource: pokeapi.co/api"
  );
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokemonNo}`
  );
  const data = await response.json();
  console.timeEnd(
    "Cache layer 1 Miss\nFetching from public datasource: pokeapi.co/api"
  );
  return data;
};

router.get(`/:pokemon`, mwCacheFlagger, async (req, res) => {
  const { useCache } = req;
  const pokemonNo = req.params.pokemon;

  const cacheDataLayer1 = useCache ? await redis.get(pokemonNo) : null;
  if (!cacheDataLayer1) {
    // Get from 3rd party source
    const dataFrom3rdParty = await getDataFrom3rdPartySource(pokemonNo);

    // Set my redis cache
    const cacheKeyLayer1 = pokemonNo;
    await redis.setex(cacheKeyLayer1, 3600, JSON.stringify(dataFrom3rdParty));
    return res.json(dataFrom3rdParty);
  }

  console.time("Cache layer 1 Hit");
  const resParsedFromCache = JSON.parse(cacheDataLayer1);
  console.timeEnd("Cache layer 1 Hit");

  return res.json(resParsedFromCache);
});

router.get(`/sprite/:pokemon`, mwCacheFlagger, async (req, res) => {
  const { useCache } = req;
  const pokemonNo = req.params.pokemon;
  const cacheKeyLayer2 = `${pokemonNo}:sprites`;

  // call my lw endpoint
  try {
    const cachedDataLayer2 = useCache ? await redis.get(cacheKeyLayer2) : null;

    if (!cachedDataLayer2) {
      const cacheKeyLayer1 = pokemonNo;
      try {
        console.time("Cache layer 2 Miss");
        const cacheDataLayer1 = useCache
          ? await redis.get(cacheKeyLayer1)
          : null;
        console.timeEnd("Cache layer 2 Miss");

        if (!cacheDataLayer1) {
          try {
            const data = await getDataFrom3rdPartySource(pokemonNo);
            return res.json(data);
          } catch (error) {
            return res.status(500).send("An error occurred");
          }
        }
        console.time("Cache layer 1 Hit");
        const resParsedFromCache = JSON.parse(cacheDataLayer1);
        console.timeEnd("Cache layer 1 Hit");

        const sprites = resParsedFromCache.sprites;
        const filteredSprites = spritesOnlyDefault(sprites);

        await redis.setex(
          cacheKeyLayer2,
          3600,
          JSON.stringify(filteredSprites)
        );

        return res.json(filteredSprites);
      } catch {
        return res.status(500).send("An error occurred");
      }
    }
    console.time("Cache layer 2 Hit");
    const resParsedFromCache = JSON.parse(cachedDataLayer2);
    console.timeEnd("Cache layer 2 Hit");

    return res.json(resParsedFromCache);
  } catch {
    return res.status(500).send("An error occurred");
  }
});

module.exports = router;
