const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));
app.use(
  cors({
    // origin: ["http://localhost:5500", "http://127.0.0.2:5500"],
  })
);

const download = require("./routes/download");
const downloadByStream = require("./routes/downloadByStream");
const listRoutes = require("./routes/list");
const pokemonRoutes = require("./routes/pokemon/pokemon");

app.use("/downloads", download);
app.use("/downloadbystream", downloadByStream);
app.use("/list", listRoutes);
app.use("/pokemon", pokemonRoutes);

const getDirectoryContent = require("./utils/getDirectoryContent");

app.get("/", (req, res) => {
  const directoryContent = getDirectoryContent("/public");
  console.log(directoryContent);

  res.send(
    '<a href="/set-cookie">Set cookie</a><br/><a href="/pokemon/ditto">Fetch pokemon ditto</a><br/><a href="/downloads/ditto">Download ditto</a><br/><a href="/downloadByStream/ditto">Download ditto by stream</a>'
  );
});

app.get("/links", async (req, res) => {
  const data = require("./data/links");
  const downloads = await getDirectoryContent("./public/downloads");
  const imgs = await getDirectoryContent("./public/imgs");

  const response = [...data, ...downloads, ...imgs];
  console.log(response);

  return res.json(response);
});

app.get("/set-cookie", (req, res) => {
  res.cookie("user_session", "some_secure_value", {
    httpOnly: true, // Makes the cookie inaccessible to JavaScript
    secure: true, // Ensures the cookie is only sent over HTTPS
    maxAge: 3000, // Sets the cookie expiration time (in milliseconds)
  });

  res.send('<div>Cookie is set</div><a href="/">Home</a>');
});

// app.get(`/pokemon/:pokemon`, mwCacheFlagger, async (req, res) => {
//   const pokemon = req.params.pokemon;
//   const { useCache } = req;

//   try {
//     const cachedData = useCache ? await redis.get(pokemon) : null;

//     if (cachedData) {
//       console.time("Cache Hit");
//       const resParsedFromCache = JSON.parse(cachedData);
//       console.timeEnd("Cache Hit");

//       return res.json(resParsedFromCache);
//     } else {
//       console.time("Cache Miss");
//       const response = await fetch(
//         `https://pokeapi.co/api/v2/pokemon/${pokemon}`
//       );
//       const data = await response.json();
//       await redis.setex(pokemon, 3600, JSON.stringify(data));
//       console.timeEnd("Cache Miss");

//       return res.json(data);
//     }
//   } catch {
//     res.status(500).send("An error occurred");
//   }
// });

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
