const fs = require("node:fs");
const path = require("node:path");
const { formatProjectName } = require("./utils");

const artDir = "./Art";

// Function to generate the includes.js content
async function generateIncludes() {
  const studentDirs = fs
    .readdirSync(artDir)
    .filter((dir) => fs.lstatSync(path.join(artDir, dir)).isDirectory());

  const cards = [];

  for(const dir of studentDirs){
    const projectPath 		= path.join(artDir, dir);
    const metaDataPath 		= path.resolve(projectPath, 'meta.json');

    // Gets HTML and CSS file paths
    const pageLink = `./Art/${dir}/index.html`;
    const imageLink = `./Art/${dir}/icon.png`;

	try {
    	// Loads contribution meta data info
		const metaData = require(metaDataPath)

		// Add the project to the cards array
		cards.push({
			author: metaData.githubHandle,
			artName: formatProjectName( metaData.artName ),
			githubLink: `https://github.com/${ metaData.githubHandle }`,
			pageLink,
			imageLink,
			projectPath
		});
	} catch(error){
		console.error(`[ ERROR x MISSING METADATA ]\n\t - Concerning folder: "${projectPath}"`);
		fs.rm(projectPath, { recursive: true })
		console.error(`\t|____ Folder removed: "${projectPath}"\n`);
	}
   }

  // Write the content to includes.js file
  fs.writeFileSync("public/cards.json", JSON.stringify(cards, null, 2));
}

generateIncludes();
