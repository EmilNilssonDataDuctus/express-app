async function fetchDownloadLinks() {
  console.log("fetching downloadlinks");
  try {
    const data = await fetch("http://localhost:3000/links").then((res) =>
      res.json()
    );
    console.log("data: ", data);
    const linksHTML = createLinks(data);
    document.getElementById("linksContainer").innerHTML = linksHTML;
  } catch (err) {
    console.error(err);
  }
}

function createLinks(linkJSON) {
  // Recursive function to generate nested HTML
  function generateHTML(items) {
    const listItems = items
      .map((item) => {
        if (Array.isArray(item)) {
          // If the item is an array, treat it as nested items
          return `<li>${generateHTML(item)}</li>`;
        } else if (item.children || item.isDirectory) {
          // If the item has children, it's a folder
          return `<li>${item.name}${generateHTML(item.children)}</li>`;
        } else {
          // If it's a file, create a link
          return `<li><a href="/downloads/${item.name}" target="_blank">${item.name}</a></li>`;
        }
      })
      .join(""); // Combine all list items into a single string

    return `<ul>${listItems}</ul>`;
  }

  // Generate the full HTML structure
  return generateHTML(linkJSON);
}
