const util = require("node:util");
const { exec } = require('node:child_process');
const execPromise = util.promisify(exec);


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

module.exports = {
	handleExtraHyphens
}