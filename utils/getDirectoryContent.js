const fs = require("fs");
const path = require("path");

/**
 * Reads the contents of a directory and returns an array of file info objects.
 * @param {string} directoryPath - The path to the directory.
 * @returns {Promise<Array>} A promise that resolves to an array of file information objects.
 */
function getDirectoryContent(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        return reject(new Error(`Error reading directory: ${err.message}`));
      }

      const fileList = files.map((file) => {
        const filePath = path.join(directoryPath, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size, // File size in bytes
          isDirectory: stats.isDirectory(), // Whether it's a folder
        };
      });

      resolve(fileList);
    });
  });
}

module.exports = getDirectoryContent;
