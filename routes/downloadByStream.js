const express = require("express");

const router = express.Router();

router.get("/:file", (req, res) => {
  const fileName = req.params.file;
  const filePath = path.join(__dirname, "files", fileName);

  res.send("Downloads file: " + fileName + ". From filepath: " + filePath);
});

module.exports = router;
