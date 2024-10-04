const fs = require("fs");
const path = require("path");
const { handleExtraHyphens} = require('./generateCards.services');


const artDir = "./Art";

// Function to generate the includes.js content
async function generateIncludes() {
  const studentDirs = fs
    .readdirSync(artDir)
    .filter((dir) => fs.lstatSync(path.join(artDir, dir)).isDirectory());

  const cards = [];

	for(const dir of studentDirs){
      const projectPath = path.join(artDir, dir);
	  const dirDetailsStrings = dir.split('-');
	  
	  
	  // handle name
	  let authorName = dirDetailsStrings[0]; // Default authorName case - first word before first hyphen
	  let projectName = dirDetailsStrings.slice(1).join('-'); // Default authorName case - Everything after the first hyphen
	  
	  /**
	   * Two cases to consider
	   * - username can have hyphen(s)
	   * - title can have hyphen(s)
	   * Overrides once more than one hyphens is detected by
	   * checking existence of github user's URL
	   */
	  const BASIC_LENGTH_CASE = 2;
	  const shouldHandleExtraHyphens = dirDetailsStrings.length > BASIC_LENGTH_CASE;
	  if(shouldHandleExtraHyphens){
	  	const data = await handleExtraHyphens(dirDetailsStrings);
	  	authorName 	= data.authorName;
	  	projectName = data.projectName;
	  }
  
      projectName = projectName.replace(/([A-Z])/g, ' $1').trim(); // Handles camel case project name

       // Handles underscores case in project name
      if( projectName.includes('_') ){
        projectName = projectName.replace(/(_)/g, ' ').trim();
      }
      const projectUrl = `./Art/${dir}/index.html`;
      const projectImage = `./Art/${dir}/icon.png`;
  
      // Add the project to the cards array
      cards.push({
        artName: projectName,
        pageLink: projectUrl,
        imageLink: projectImage,
        author: authorName,
        githubLink: `https://github.com/${authorName}`,
        projectPath
      });
	}


  // Write the content to includes.js file
  fs.writeFileSync("public/cards.json", JSON.stringify(cards, null, 2));
}

generateIncludes();

