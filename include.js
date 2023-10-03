const fs = require('fs');
const currentDirectory = (typeof __dirname !== 'undefined') ? __dirname : (typeof document !== 'undefined' ? document.currentScript.src : '');

let cards = [
  {
    artName: 'spinning square',
    pageLink: './Art/dmdiamond79/spinningsquare.html',
    imageLink: './Art/dmdiamond79/spinning.gif',
    author: 'dmdiamond79',
    githubLink: 'https://github.com/dmdiamond79'
  }
];


const rootDirectory = currentDirectory; // Replace with your root directory path
// Function to collect JSON files from a directory and its subdirectories
function collectJsonFiles(directoryPath, fileList = []) {
  const files = fs.readdirSync(directoryPath);

  for (const file of files) {
    const filePath = directoryPath+"/"+file;
    const stat = fs.statSync(filePath);
    // console.log("Directory Path :: is", file)
    if (stat.isDirectory()) {
      // If it's a directory, recursively search for JSON files inside it
      collectJsonFiles(filePath, fileList);
    } else if (file.split(".")[1] === 'json') {
      console.log("Json file :: ", file)
      // If it's a JSON file, read and add it to the list
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        fileList.push(jsonData);
      } catch (error) {
        console.error(`Error reading JSON from ${filePath}: ${error.message}`);
      }
    }
  }

  return fileList;
}

// Specify the root directory where you want to start searching

// Call the function to collect JSON files
const jsonPayloads = collectJsonFiles(rootDirectory);

// Now, jsonPayloads array contains all the JSON payloads from the nested folder tree

console.log('Current working directory:', currentDirectory);


// +--------------------------------------------------------------------------------+
// +                                                                                +
// +                  YOU DO NOT NEED TO CHANGE ANYTHING BELOW THIS                 +
// +                                                                                +
// +--------------------------------------------------------------------------------+

// Creates cards from the array above
// You don't need to modify this
let contents = [];
Shuffle(cards).forEach((c) => {
  contents.push([
    `<li class="card">` +
      `<a href='${c.pageLink}'>` +
      `<img class="art-image" src='${c.imageLink}' alt='${c.artName}' />` +
      `</a>` +
      `<div class="flex-content">` +
      `<a href='${c.pageLink}'><h3 class="art-title">${c.artName}</h3></a>` +
      `<p class='author'><a href="${c.githubLink}" target="_blank"><i class="fab fa-github"></i> ${c.author}</a> </p>` +
      `</div>` +
      `</li>`
  ]);
});

document.getElementById('cards').innerHTML = contents;

function Shuffle(o) {
  for (
    var j, x, i = o.length;
    i;
    j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x
  );
  return o;
}
