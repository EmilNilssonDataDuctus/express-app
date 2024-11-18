const express = require("express");
var path = require("path");
var fs = require("fs");
const router = express.Router();

router.get("/:file", (req, res) => {
  const fileName = req.params.file;
  const filePath = path.join(__dirname, "files", fileName);

  return res.send("<a href='./dl/"+ fileName + "'>Click to download</a></br>Downloads file: <b>" + fileName + "</b>. </br>From filepath: <b>" + filePath + "</b>");
});

router.get("/dl/:file", (req, res) => {
  const filename = req.params.file;
  const filePath = path.join(__dirname, 'public', filename); // Adjust to your file directory

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log("Looking for file in filepath: <b>" + filePath + "</b>");
    
      return res.status(404).send('File not found');
  }

  // Stream the file to the response
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);

  // Handle stream errors
  fileStream.on('error', (err) => {
      console.error(err);
      res.status(500).send('Error reading file');
  });
});

module.exports = router;
