const express = require("express");
const path = require("path");
const getDirectoryContents = require("../utils/getDirectoryContent");

const router = express.Router();

// Endpoint to list files in the public folder
router.get("/list-files", async (req, res) => {
  const publicDirectory = path.join(__dirname, "../public");

  try {
    const files = await getDirectoryContents(publicDirectory);
    res.json(files); // Send the list of files as JSON
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
