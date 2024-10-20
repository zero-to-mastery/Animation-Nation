/**
	File to remove once the project repo is updated for 
	all user to include `meta.json`
	- accordingly: we need to remove:
	 	- import in `./generateCards.js`
		- its execution block in `./generateCards.js`
		where the TODO comment is 
 */

const util 			= require("node:util");
const { exec } 		= require('node:child_process');

const fs 			= require('node:fs');
const path 			= require('node:path');
const { formatProjectName } = require('./utils');
const CONTRIBUTIONS_FOLDER 	= path.resolve(__dirname, '..', 'Art');

const execPromise 	= util.promisify(exec);

/** Init empty meta.json file or updates it */
const handleMetaFile = ( folderName, metaData ) => {
	const metaFileTemplate = {
		"artName" : "",
		"githubHandle" : "",
	}
	const metaFilePath = path.resolve( CONTRIBUTIONS_FOLDER, folderName, 'meta.json' );
	const _metaData = metaData || metaFileTemplate;
	fs.writeFileSync(
		metaFilePath,
		JSON.stringify(_metaData, null, 2)
	);
}

/** Either create an empty file or updates it */
const handleMissingMetaData = async (folderName) => {
	const details = folderName.split('-');
	const shouldHandleExtraHyphens = details.length > 2;
	let githubHandle, artName;

	if( shouldHandleExtraHyphens ){
        const data = await handleExtraHyphens(details);
		githubHandle 	= data.authorName;
		artName = data.projectName;
	} else {
		githubHandle 	= details[0];
		artName = details[1];
	}

	const currentMetaData = {
		githubHandle,
		artName: formatProjectName(artName)
	}
	handleMetaFile( folderName, currentMetaData );
}


module.exports = { handleMissingMetaData };




/**
 * Checks URL requests response status code
 * - is 404: username does not exist
 * - else: username does exist
 */
async function isExistingGithubUsername ( possibleUsername ){
	const githubUrl = `https://github.com/${possibleUsername}`;
	const curlRequestForStatusCode = `curl --head -s "${githubUrl}" | awk 'NR==1 {print $2}'`;

	try {
		const { stdout } = await execPromise(curlRequestForStatusCode);
		return Number(stdout) !== 404;
	} catch( error ){
		return false;
	}
}

/**
 * Handles directory names with multiple hyphens to get 
 * the real distinction between the official author name and
 * the project name
 * @returns authorName, projectName 
 */
async function handleExtraHyphens(detailsStrings){
	let endUsernameIdx = detailsStrings.length - 1;
	let dataDetails;

	// while it is within author name possible range
	while (endUsernameIdx >= -1 && !dataDetails ){
		let potentialUsername = detailsStrings
			.slice(0, endUsernameIdx)
			.join('-');
		const isExistingUserName = await isExistingGithubUsername(potentialUsername);

		if ( isExistingUserName ){
			dataDetails = {
				authorName: potentialUsername,
				projectName: detailsStrings.slice(endUsernameIdx).join(' ')
			}
		}
		endUsernameIdx -= 1;
	}
	return dataDetails;
}
