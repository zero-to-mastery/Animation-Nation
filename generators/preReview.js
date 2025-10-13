const fs = require('node:fs/promises');

/* Github Actions values to use */
const CONTRIBUTOR_HANDLER = process.env.CONTRIBUTOR || '';
const CHANGED_FILES_STR = process.env?.CHANGED_FILES || '';
const EXPECTED_FILE = {
  html: 'index.html',
  css : 'styles.css',
  json: 'meta.json',
}
const IS_MAINTAINER = ['admin', 'maintain'].includes(
  process.env?.GITHUB_PERMISSION_ROLE || ''
);

/* Patterns */
const PATTERN = {
  folderUsername: new RegExp(`^Art/${CONTRIBUTOR_HANDLER}`, 'i'),
  requiredFiles: new RegExp(`(${EXPECTED_FILE.html}|${EXPECTED_FILE.css}|${EXPECTED_FILE.json})$`),
  extension: {
    self: /\.\w+$/,
    images: /(png|jpe?g)$/,
    expected: /(.html|.css|.json)$/
  },
  html: {
    scriptTag: /<script\b[^>]*>/i,
    styleTag: /<style\b[^>]*>/i
  },
  css: {
    linkTag: /<link\s+[^>]*href=["'](\.?\/)?styles\.css["']?[^>]*>/i,
    keyframes: /@keyframes/gi,
    interactiveElements: /\w+\s?:{1,2}\s?(hover|active)/gm
  },
  json: {
    artNameProperty: /"artName":\s*".+"/gi,
    githubHandleProperty: /"githubHandle"\s*:\s*".+?"/gi
  }
}


/* ------------------------------- Predicates ------------------------------- */

const doesStartWithArt = f =>  f.startsWith('Art/')
const isValidFolderName = f => PATTERN.folderUsername.test(f)
const isExpectedFileName = (filename, expectedFilename) => filename.endsWith(expectedFilename)
const hasSpace = f => /\s/g.test(f)

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

/* ------------------------------- Uilitaries ------------------------------- */
const extractFileExtension = f => f.match(PATTERN.extension.self)?.[0]?.slice(1) || ''

/** Create a feedbackList to format inputs based on `mode` (line | task) */
const createFeedbackList = (feedbackList = [], mode = 'line') => {
  return (message) => {
    const feedback = mode == 'task' ? `\t> - [ ] ${message}` : message;
    feedbackList.push(feedback);
  };
};

/** Review contribution files  */
const reviewFile = (file, fileContent, checkerFn) => {
  const feedbackList = [];
  if (!checkerFn) return feedbackList;

  let fileType = checkerFn.name.replace(/^check/i, '').toLowerCase();
  if (!file.endsWith(`.${fileType}`)) return feedbackList;

  const pushFeedback = createFeedbackList(feedbackList, 'task');
  checkerFn(file, fileContent, pushFeedback);

  // Prepends feedback header if any feedback items
  if (feedbackList.length) {
    const headerReview = `\n- **${fileType.toUpperCase()} feedback for _\`${file}\`_**`;
    feedbackList.unshift(headerReview);
  }

  return feedbackList;
};



/* --------------------------- Feedback checkers --------------------------- */

/** Gives feedback on empty files if necessary and returns if has empty file  */
const reviewEmptyFileFeedback = (file, fileContent, pushFeedbackFn ) => {
  const isEmpty = !fileContent.trim()
  if( isEmpty){
    pushFeedbackFn(`Empty file, add the code for the file \`${file}\``)
  }
  return isEmpty
}

const reviewExpectedFileFeedback = (file, extectedFile, pushFeedbackFn ) => {
  const isCorrectFileName = isExpectedFileName(file, extectedFile)
  if (!isCorrectFileName) {
    pushFeedbackFn(
      `Incorrect filename: please rename as recommended or remove if unnecessary`
    );
  }
  return isCorrectFileName
}

const reviewFileSpecs = (file, fileContent, pushFeedback ) => {
  // [ CASE ] Gives feedback on expected and incorrect file name
  const fileExtension = extractFileExtension(file)
  if( fileExtension ){
    reviewExpectedFileFeedback(file, EXPECTED_FILE?.[fileExtension], pushFeedback)
  }
  
  // [ CASE ] Gives feedback on empty file and shortcuts if this is the case
  const isEmptyFile = reviewEmptyFileFeedback(file, fileContent, pushFeedback)
  const shouldContinue = !isEmptyFile
  return shouldContinue
}
/* ------------------------------------ - ----------------------------------- */

/** Establishes a state about the contribution
 * - correctFiles: any file matching file naming
 * - incorrectFiles: any file not matching file naming
 */
const getContributionState = () => {
  const changedFiles = CHANGED_FILES_STR.split('\n') || [];

  // Separates changed file to "incorrectFiles" or "correctFiles"
  const fileCorrectness = changedFiles.reduce(
    (details, file) => {
      const detailsProperty = PATTERN.requiredFiles.test(file)
        ? details.correctFiles
        : details.incorrectFiles;

      detailsProperty.push(file);
      return details;
    },
    { incorrectFiles: [], correctFiles: [] }
  );

  const state = {
    changedFiles,
    ...fileCorrectness
  };
  return state;
};

/* -------------------------------------------------------------------------- */
/*                            Contribution Checkers                           */
/* -------------------------------------------------------------------------- */

/* Checks Overall Contribution - without specific file content */
const checkGlobally = (contributionStates) => {
  const feedbackList = [];
  const pushFeedback = createFeedbackList(feedbackList, 'task');
  const { changedFiles, incorrectFiles } = contributionStates;

  /* --------------------------- FOLDER LEVEL CHECKS -------------------------- */
  
  
  /* [ CASE ] Gives feedback on missing Art/* files 
  *  - For Any non maintainers' contributions
  *  - For maintainers participating as contributors
  * */
  const artFolderFiles = changedFiles.filter(doesStartWithArt);
  const has3FilesInArt = artFolderFiles.length === 3;
  const isMaintainerAsContributor = IS_MAINTAINER && artFolderFiles.length > 0


  if (!has3FilesInArt && (!IS_MAINTAINER || isMaintainerAsContributor)) {
    pushFeedback(
      `Missing files in your contribution: include all required files inside the \`Art/\` folder - (3 files expected)`
    );
  }

  /** [ CASE ] Gives feedback on incorrect folder name */
  if( !artFolderFiles.every(isValidFolderName) ){
    pushFeedback(
      `Incorrect folder name: it should start with your GitHub handle, followed by your art name, inside the Art/ folder.`
    )
  }

  /* ------------------ INCORRECT FILES SCOPE CHECKS --------------------------- */
  /** Files besides HTML, CSS, JSON files in Art folder */
  for (const file of incorrectFiles) {
    const isInContributorFolder = isValidFolderName(file)
    const isInsideArtFolder     = doesStartWithArt(file);

    const isIcon = file.includes('icon');
    const isPictural = PATTERN.extension.images.test(file);

    // Excludes html, css, json as they have their own checkers
    const isOveralCompliant = PATTERN.extension.expected.test(file);

    // Defines reasons for file incorrections
    let reason = '';

    // [ CASE REASON ] Gives feedback on files [in/out]-side the "Art/<GITHUB_HANDLE>" folder
    if (isInContributorFolder) reason = 'not allowed for animations';
    if (!isInContributorFolder) reason = 'this should not be part of your contribution';

    // [ CASE REASON ] Gives feedback on pictural content
    if (isPictural && !isIcon)
      reason = 'pictures are not allowed, use online ones';
    if (isPictural && isIcon) reason = 'icons are auto-generated after merge';

    /* Deduces user kinds ( maintainers or regular contributors )
      - Maintainers:
        - can have pre-review feedback on "Art" contribution
        - can contributes in touching other files without having invading feedback 
      - Regular contributors can only add contribution to "Art"
    */
    const isContributorInsideArt  = !IS_MAINTAINER && isInsideArtFolder;
    const isContributorOutsideArt = !IS_MAINTAINER && !isInsideArtFolder;
    const isMaintenerInsideArt    = IS_MAINTAINER && isInsideArtFolder;

    const isFeedbackForUser =
    isContributorInsideArt || isContributorOutsideArt || isMaintenerInsideArt;

    // [ CASE ] Gives feedback based on: user kind and contexts based on Art folder
    if (!isOveralCompliant && isFeedbackForUser) {
      pushFeedback(`Remove unnecessary file: \`${file}\` - ${reason}`);
    }
  }

  // If any feedback are provided, sets the header "Overall feedback"
  if (feedbackList.length) feedbackList.unshift('\n- **Overall feedback**');
  return feedbackList;
};

/** Checks HTML content in details */
const checkHTML = (file, fileContent, pushFeedback) => {

  // [ CASES ] Checks general file specs
  const shouldContinue = reviewFileSpecs(file, fileContent, pushFeedback)
  if (!shouldContinue ) return

  // HTML checks interpretations
  const hasScriptTag = PATTERN.html.scriptTag.test(fileContent);
  const hasStyleTag = PATTERN.html.styleTag.test(fileContent)
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
  if ( hasStyleTag ){
    pushFeedback(
      'Incorrect styling approach: please make a stylesheet file out of the style tag'
    );
  }
};

/** Checks CSS content in details */
const checkCSS = (file, fileContent, pushFeedback) => {

  // [ CASES ] Gives feedback on general file specs
  const shouldContinue = reviewFileSpecs(file, fileContent, pushFeedback)
  if (!shouldContinue ) return  
  
  // [ CASE ] Gives feedback on missing CSS animation(s) check
  const hasCSSAnimation = PATTERN.css.keyframes.test(fileContent);
  if (!hasCSSAnimation) {
    pushFeedback(
      'Missing animation: include at least one `@keyframes` definition and use the `animation` property'
    );
  }

  // [ CASE ] Gives feedback on interactive CSS animations
  if( PATTERN.css.interactiveElements.test(fileContent)){
    pushFeedback(
      'Incorrect animation trigger: remove any pseudo elements with your animation(s) and attach the animation to the concerned element'
    )
  }
};

/** Checks JSON content in details */
const checkJSON = (file, fileContent, pushFeedback) => {

  // [ CASES ] Gives feedback on file specs
  const shouldContinue = reviewFileSpecs(file, fileContent, pushFeedback)
  if (!shouldContinue ) return

  // [ CASE ] Gives feedback on invalid JSON
  let metaJSON = {}
  try {
    metaJSON = JSON.parse( fileContent )
  } catch {
    pushFeedback('Invalid JSON structure — please ensure valid JSON format')
    return
  }

  const metaKeys = Object.keys(metaJSON)
  if(!metaKeys.length) return 

  // [ CASE ] Gives feedback on extra properties
  if (metaKeys.length > 2 ){
    pushFeedback(
      'Remove extra properties — only `githubHandle` and `artName` should be present'
    );
  }
  
  // [ CASE ] Gives feedback on missing art name value 
  if (!metaJSON?.artName){
    pushFeedback('Missing `artName`: please include an `artName` value');
  }
  
  // Check for matched contributor github handle 
  const hasCorrectGithubHandle = new RegExp(CONTRIBUTOR_HANDLER, 'i').test(metaJSON?.githubHandle);

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
}



/* -------------------------------------------------------------------------- */
/*                          Logic Orchestration Items                         */
/* -------------------------------------------------------------------------- */
/* File details reviews: checks all files and their content */
const reviewContribution = async (contributionStates) => {
  let feedbackList = [];
  const pushFeedback = createFeedbackList(feedbackList, 'task');

  // Files
  const { changedFiles } = contributionStates;
  const changedFilesWithSpace = changedFiles.filter(hasSpace);

  // [ CASE ] Give feedback on filename containing spaces
  if (changedFilesWithSpace.length) {
    pushFeedback(
      'Space(s) detected in file or folder name(s) - please remove them'
    );
  }

  const changedFilesWithoutSpace = changedFiles.filter(
    (filename) => !hasSpace(filename)
  );
  // Files Checks
  const filesReviews = { html: [], css: [], json: []}
  for (const file of changedFilesWithoutSpace) {
    if (!file) continue;

    // Reads file
    let fileContent = ''
    try {
      fileContent = await fs.readFile(file, 'utf-8')
    } catch { continue }

    // [ CASE ] Gives reviews for empty files other than expected one
    const isReviewableFile = PATTERN.extension.expected.test(file);
    if (!fileContent && !isReviewableFile) {
      pushFeedback(`Empty file, add content to your file \`${file}\``);
    }
    // [ CASE ] Gives reviews all accepted files
    else {
      [checkHTML, checkCSS, checkJSON ].forEach( checkFileFn => {
        const fileKind = checkFileFn.name.replace(/^check/i, '').toLowerCase()

        filesReviews[ fileKind ] = [
          ...filesReviews[ fileKind ],
          ...(reviewFile(file, fileContent, checkFileFn) || [])
        ]
      })
    }
  }

  feedbackList = [
    ...feedbackList,
    ...filesReviews.html,
    ...filesReviews.css,
    ...filesReviews.json,
  ];

  const overviewReviews = checkGlobally(contributionStates);
  return [...overviewReviews, ...feedbackList];
};

/** Generates the final pre-review message */
const generateReviewMessage = (feedbackList) => {
  const interlocutor = CONTRIBUTOR_HANDLER
    ? `@${CONTRIBUTOR_HANDLER}`
    : 'Dear Contributor';

  const messageLines = [
    `Aloha ${interlocutor} 🙌 - Thanks for your contribution!`
  ];
  const messagePush = createFeedbackList(messageLines, 'line');

  if (feedbackList.length) {
    messagePush(
      'Before we can merge your submission, please address the following points.'
    );
    messagePush('\n## Feedback');

    // Tip message refering to README
    const readmeLink =
      '[README.md](https://github.com/zero-to-mastery/Animation-Nation/blob/master/README.md)';
    messagePush(
      `> [!TIP] \n> _You can refer to ${readmeLink} for additional guidance._`
    );

    // List of feedback to address
    const taskList = feedbackList.join('\n');
    messagePush(taskList);
  } else {
    messagePush('\n🎉 Your submission meets all pre-review requirements!');
    messagePush('It’s now awaiting final validation from a maintainer.');
  }

  messageLines.push('\n\nHappy Coding! 🚀');
  const messageReview = messageLines.join('\n');
  return messageReview;
};


/* -------------------------------------------------------------------------- */
/*                                    MAIN                                    */
/* -------------------------------------------------------------------------- */
/** Automatically run the script */
;(async () => {
  const contributionState = getContributionState();
  const feedbackList = await reviewContribution(contributionState);
  const PRFinalReview = generateReviewMessage(feedbackList);
  console.info(PRFinalReview);
})();
