const fs = require("fs");
const path = require("path");

const artDir = "./Art";

// Function to generate the includes.js content
function generateIncludes() {
  const studentDirs = fs
    .readdirSync(artDir)
    .filter((dir) => fs.lstatSync(path.join(artDir, dir)).isDirectory());

  const cards = studentDirs.map((dir) => {
    const projectPath = path.join(artDir, dir);

    // Use directory name, splitting on the last hyphen
    const lastHyphenIndex = dir.lastIndexOf('-');
    const authorName = dir.substring(0, lastHyphenIndex); // Everything before the last hyphen
    let projectName = dir.substring(lastHyphenIndex + 1); // Everything after the last hyphen

    // Handle camel case and underscores in project name
    projectName = projectName.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();

    const projectUrl = `./Art/${dir}/index.html`;
    const projectImage = `./Art/${dir}/icon.png`;

    return {
      artName: projectName,
      pageLink: projectUrl,
      imageLink: projectImage,
      author: authorName,
      githubLink: `https://github.com/${authorName}`,
      projectPath
    };
  });

  // Write the content to includes.js file
  fs.writeFileSync("public/cards.json", JSON.stringify(cards, null, 2));
}

generateIncludes();
