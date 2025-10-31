const {
  CONTRIBUTOR_HANDLER,
  IS_MAINTAINER,
  PATTERN,
  EXPECTED_FILE_COUNT
} = require('./preReview.constants.js');

const {
  doesStartWithArt,
  isValidFolderName,
  createFeedbackList
} = require('./preReview.helpers.js');

const {
  reviewFileSpecs,
  reviewOverallFiles
} = require('./preReview.reviewers.js');
/* -------------------------------------------------------------------------- */
/*                            Contribution Checkers                           */
/* -------------------------------------------------------------------------- */

/* Checks Overall Contribution - without specific file content */
const checkGlobally = (contributionStates) => {
  const feedbackList = [];
  const pushFeedback = createFeedbackList(feedbackList, 'task');

  // Gets remaining files to process ( not handled in globalCheck )
  const { incorrectFiles, detailsPerExtension } = contributionStates;
  const remainingFilesToProcess = incorrectFiles.filter(
    (f) =>
      ![
        ...detailsPerExtension.rejected.files,
        ...detailsPerExtension.forbidden.files,
        ...detailsPerExtension.images.files
      ].includes(f)
  );

  /* --------------------------- FOLDER LEVEL CHECKS -------------------------- */

  /* [ CASE ] Gives feedback on missing Art/* files
   *  - For Any non maintainers' contributions
   *  - For maintainers participating as contributors
   * */
  reviewOverallFiles(contributionStates, pushFeedback);

  /** [ CASE ] Gives feedback on incorrect folder name */
  if (!remainingFilesToProcess.every(isValidFolderName)) {
    pushFeedback(
      `Incorrect folder name: it should start with your GitHub handle, followed by your art name, inside the Art/ folder.`
    );
  }

  /* ------------------ INCORRECT FILES SCOPE CHECKS --------------------------- */
  /** Files besides HTML, CSS, JSON files in Art folder */
  for (const file of remainingFilesToProcess) {
    const isInContributorFolder = isValidFolderName(file);
    const isInsideArtFolder = doesStartWithArt(file);

    // Excludes html, css, json as they have their own checkers
    const isOveralCompliant = PATTERN.extension.expected.test(file);

    // Defines reasons for file incorrections
    let reason = '';

    // [ CASE REASON ] Gives feedback on files [in/out]-side the "Art/<GITHUB_HANDLE>" folder
    if (isInContributorFolder) reason = 'not allowed for animations';
    if (!isInContributorFolder)
      reason = 'this should not be part of your contribution';

    /* Deduces user kinds ( maintainers or regular contributors )
        - Maintainers:
        - can have pre-review feedback on "Art" contribution
        - can contributes in touching other files without having invading feedback 
        - Regular contributors can only add contribution to "Art"
        */
    const isContributorInsideArt = !IS_MAINTAINER && isInsideArtFolder;
    const isContributorOutsideArt = !IS_MAINTAINER && !isInsideArtFolder;
    const isMaintenerInsideArt = IS_MAINTAINER && isInsideArtFolder;

    const isFeedbackForUser =
      isContributorInsideArt || isContributorOutsideArt || isMaintenerInsideArt;

    // [ CASE ] Gives feedback based on: user kind and contexts based on Art folder
    if (!isOveralCompliant && isFeedbackForUser) {
      pushFeedback(`Remove unnecessary file: \`${file}\` - ${reason}`);
    }
  }

  // If any feedback are provided, sets the header "Overall feedback"
  if (feedbackList.length)
    feedbackList.unshift(
      `\n- **Overall feedback**\n\tReminder: the contribution should have ${EXPECTED_FILE_COUNT} files in a folder in Art`
    );
  return feedbackList;
};

/** Checks HTML content in details */
const checkHTML = (file, fileContent, pushFeedback) => {
  // [ CASES ] Checks general file specs
  const shouldContinue = reviewFileSpecs(file, fileContent, pushFeedback);
  if (!shouldContinue) return;

  // HTML checks interpretations
  const hasScriptTag = PATTERN.html.scriptTag.test(fileContent);
  const hasStyleTag = PATTERN.html.styleTag.test(fileContent);
  const hasCSS = fileContent.includes('.css');
  const hasCorrectStylesheet = PATTERN.css.linkTag.test(fileContent);

  // [ CASE ] Gives feedback on JS within
  if (hasScriptTag) {
    pushFeedback(`Remove **any JavaScript content** from your HTML file`);
  }

  // [ CASE ] Gives feedback on any missing CSS file
  if (!hasCSS) {
    pushFeedback(
      'Missing linked stylesheet file: link the CSS file to your HTML'
    );
  }

  // [ CASE ] Gives feedback on incorrect a CSS file name
  else if (!hasCorrectStylesheet) {
    pushFeedback(
      'Incorrect stylesheet link: update the `href` so it points to the correct CSS file'
    );
  }

  // [ CASE ] Gives feedback on incorrect styling approach ( inline style in HTML )
  if (hasStyleTag) {
    pushFeedback(
      'Incorrect styling approach: please make a stylesheet file out of the style tag'
    );
  }
};

/** Checks CSS content in details */
const checkCSS = (file, fileContent, pushFeedback) => {
  // [ CASES ] Gives feedback on general file specs
  const shouldContinue = reviewFileSpecs(file, fileContent, pushFeedback);
  if (!shouldContinue) return;

  // [ CASE ] Gives feedback on missing CSS animation(s) check
  const hasCSSAnimation = PATTERN.css.keyframes.test(fileContent);
  if (!hasCSSAnimation) {
    pushFeedback(
      'Missing animation: include at least one `@keyframes` definition and use the `animation` property'
    );
  }

  // [ CASE ] Gives feedback on interactive CSS animations
  if (PATTERN.css.interactiveElements.test(fileContent)) {
    pushFeedback(
      'Incorrect animation trigger: remove any pseudo classes with your animation(s) and attach the animation to the concerned element'
    );
  }
};

/** Checks JSON content in details */
const checkJSON = (file, fileContent, pushFeedback) => {
  // [ CASES ] Gives feedback on file specs
  const shouldContinue = reviewFileSpecs(file, fileContent, pushFeedback);
  if (!shouldContinue) return;

  // [ CASE ] Gives feedback on invalid JSON
  let metaJSON = {};
  try {
    metaJSON = JSON.parse(fileContent);
  } catch {
    pushFeedback('Invalid JSON structure — please ensure valid JSON format');
    return;
  }

  const metaKeys = Object.keys(metaJSON);
  if (!metaKeys.length) return;

  // [ CASE ] Gives feedback on extra properties
  const extraKeys = metaKeys.filter(
    (k) => !['githubHandle', 'artName'].includes(k)
  );
  if (metaKeys.length > 2 || !!extraKeys.length) {
    const formattedExtraKeysStr = extraKeys.map((k) => `\`${k}\``).join(', ');
    pushFeedback(
      `Remove extra properties ${formattedExtraKeysStr} — only \`githubHandle\` and \`artName\` should be present`
    );
  }

  // [ CASE ] Gives feedback on missing art name value
  if (!metaJSON?.artName) {
    pushFeedback('Missing `artName`: please include an `artName` value');
  }

  // Check for matched contributor github handle
  const hasCorrectGithubHandle = new RegExp(CONTRIBUTOR_HANDLER, 'i').test(
    metaJSON?.githubHandle
  );

  // [ CASE ] Gives feedback on incorrect github handle value
  if (metaJSON?.githubHandle && !hasCorrectGithubHandle) {
    pushFeedback(
      'Unmatched `githubHandle`: make sure it matches your GitHub username'
    );
  }

  // [ CASE ] Gives feedback on missing github handle value
  else if (!metaJSON?.githubHandle) {
    pushFeedback('Missing `githubHandle`: please add your GitHub username');
  }
};

module.exports = {
  checkGlobally,
  checkHTML,
  checkCSS,
  checkJSON
};
