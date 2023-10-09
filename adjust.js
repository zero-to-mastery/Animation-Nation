const fs = require('fs');

const foldernames = fs.readdirSync(`${__dirname}/Art`);

console.log("\nCurrent directory filenames:");
foldernames.forEach(folder => {
  const data = fs.readFileSync(`${__dirname}/Art/${folder}/`, { encoding: 'utf8', flag: 'r' });
  console.log(data)
}); 