const express = require("express");
const router = express.Router();

const mwCacheFlagger = require("../../middleware/cacheFlagger");
const redis = require("../../init/redis");
const spritesOnlyDefault = require("./filters");

/* 
  Get and cache data from 3rd party datasource
*/
const apiRequest3rdPartyDataSource = async (pokemonNo) => {
  console.time("Cache layer 1 Miss");
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokemonNo}`
  );
  const data = await response.json();
  console.timeEnd("Cache layer 1 Miss");
  return data;
};

const cacheRequest = async (key, data) => {
  await redis.setex(key, 3600, JSON.stringify(data));
};

router.get(`/:pokemon`, mwCacheFlagger, async (req, res) => {
  const { useCache } = req;
  const pokemonNo = req.params.pokemon;
  console.log("Requesting pokemonNo:", pokemonNo);
  const cacheKeyLayer1 = pokemonNo;

  const cacheDataLayer1 = await redis.get(cacheKeyLayer1);
  // If not using cache or cache is empty
  // Get from 3rd party datasource
  if (!cacheDataLayer1) {
    const data = await apiRequest3rdPartyDataSource(pokemonNo);
    if (useCache) {
      // Store detils in layer 1 cache
      console.time("Cache pokeapi-data to layer 1");
      await cacheRequest(cacheKeyLayer1, data);
      console.timeEnd("Cache pokeapi-data to layer 1");
    }
    return res.json(data);
  }

  // Get data from layer 1 cache
  console.time("Cache layer 1 Hit");
  const cachedRes = JSON.parse(cacheDataLayer1);
  console.timeEnd("Cache layer 1 Hit");

  return res.json(cachedRes);
});

router.get(`/sprite/:pokemon`, mwCacheFlagger, async (req, res) => {
  const { useCache } = req;
  const pokemonNo = req.params.pokemon;
  console.log("Requesting pokemonNo:", pokemonNo);
  const cacheKeyLayer2 = `${pokemonNo}:sprites`;

  const cacheDataLayer2 = await redis.get(cacheKeyLayer2);
  // If not using cache or cache is empty
  // Get from 3rd party datasource
  if (!cacheDataLayer2) {
    console.time("Cache layer 2 Miss");
    // Check layer 1 of cache
    const cacheKeyLayer1 = pokemonNo;
    const cacheDataLayer1 = await redis.get(cacheKeyLayer1);
    console.timeEnd("Cache layer 2 Miss");
    if (!cacheDataLayer1) {
      // Check third party datasource
      const data = await apiRequest3rdPartyDataSource(pokemonNo);
      const lightweightData = spritesOnlyDefault(data.sprites);
      if (useCache) {
        // Store lightweight details in layer 2 cache
        console.time("Cache pokeapi-data to layer 2");
        await cacheRequest(cacheKeyLayer2, lightweightData);
        console.timeEnd("Cache pokeapi-data to layer 2");

        // Store details in layer 1 cache
        console.time("Cache pokeapi-data to layer 1");
        const cacheKeyLayer1 = pokemonNo;
        await cacheRequest(cacheKeyLayer1, data);
        console.timeEnd("Cache pokeapi-data to layer 1");
      }
      return res.json(lightweightData);
    }
    const lightweightData = spritesOnlyDefault(
      JSON.parse(cacheDataLayer1).sprites
    );
    if (useCache) {
      // Store lightweight details in layer 2 cache
      console.time("Cache pokeapi-data to layer 2");
      await cacheRequest(cacheKeyLayer2, lightweightData);
      console.timeEnd("Cache pokeapi-data to layer 2");
    }
    return res.json(lightweightData);
  }
  console.time("Cache hit layer 2");
  const cachedRes = JSON.parse(cacheDataLayer2);
  console.timeEnd("Cache hit layer 2");
  return res.json(cachedRes);
});

module.exports = router;
