async function listFiles() {
  const response = await fetch("/list/list-files");
  const files = await response.json();

  const fileList = document.getElementById("fileList");
  fileList.innerHTML = "";

  files.forEach((file) => {
    const listItem = document.createElement("li");
    listItem.innerHTML =
      file.name +
      (file.isDirectory
        ? " [Folder | <button onclick='listFiles()'>Click to expand</button>]"
        : ` <a href="/download/${file.name}">Download</a>`);
    fileList.appendChild(listItem);
  });
}
document.getElementById("getFiles").addEventListener("click", listFiles);
/*  */


