const fs = require("fs");
const path = require("path");

const artDir = "./Art";

// Function to generate the includes.js content
function generateIncludes() {
  const studentDirs = fs
    .readdirSync(artDir)
    .filter((dir) => fs.lstatSync(path.join(artDir, dir)).isDirectory());

  const cards = [];

  studentDirs.forEach((dir) => {
    const projectPath = path.join(artDir, dir);

    // Use directory name as project name
    const projectName = dir.split("-")[1]
    const authorName = dir.split("-")[0]; 
    const projectUrl = `../Art/${dir}/index.html`;
    const projectImage = `../Art/${dir}/icon.png`;

    // Add the project to the cards array
    cards.push({
      artName: projectName,
      pageLink: projectUrl,
      imageLink: projectImage,
      author: authorName,
      githubLink: `https://github.com/${authorName}`,
      projectPath
    });
  });

  // Write the content to includes.js file
  fs.writeFileSync("public/cards.json", JSON.stringify(cards, null, 2));
}

generateIncludes();
