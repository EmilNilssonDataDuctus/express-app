const express = require("express");
var path = require("path");
const router = express.Router();

router.get("/:file", (req, res) => {
  const fileName = req.params.file;
  const filePath = path.join(__dirname, "files", fileName);

  return res.send(
    "<a href='./dl/" +
      fileName +
      "'>Click to download</a></br>Downloads file: <b>" +
      fileName +
      "</b>. </br>From filepath: <b>" +
      filePath +
      "</b>"
  );
});

router.get("/dl/:file", (req, res) => {
  const filename = req.params.file;
  const filePath = path.join(__dirname, "public", filename); // Adjust to your file directory

  console.log("filename: " + filename);
  console.log("filePath: " + filePath);

  res.download(`${filePath}.json`, `${filename}.json`, (err) => {
    if (err) {
      console.log(err);

      console.log("Error downloading");
    } else {
      console.log("Successfully downloaded");
    }
  });
});

module.exports = router;
