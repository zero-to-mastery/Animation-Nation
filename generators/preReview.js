const fs = require('node:fs/promises');

/* Github Actions values to use */
const CONTRIBUTOR_HANDLER = process.env.CONTRIBUTOR || '';
const CHANGED_FILES_STR = process.env?.CHANGED_FILES || '';
const EXPECTED_HTML = 'index.html';
const EXPECTED_CSS = 'styles.css';
const EXPECTED_JSON = 'meta.json';
const IS_MAINTAINER = ['admin', 'maintain'].includes(
  process.env?.GITHUB_PERMISSION_ROLE || ''
);

/* Helpers */
/** Create a feedbackList - formatting the list item based on `mode` (line | task) */
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

  const feedbackPush = createFeedbackList(feedbackList, 'task');
  checkerFn(file, fileContent, feedbackPush);

  // Prepends feedback header if any feedback items
  if (feedbackList.length) {
    const headerReview = `\n- **${fileType.toUpperCase()} feedback for _\`${file}\`_**`;
    feedbackList.unshift(headerReview);
  }

  return feedbackList;
};

/* ------------------------------------ - ----------------------------------- */

/** Establishes a state about the contribution
 * - correctFiles: any file matching file naming
 * - incorrectFiles: any file not matching file naming
 */
const getContributionState = () => {
  const changedFiles = CHANGED_FILES_STR.split('\n') || [];

  const requiredFilesRegexp = new RegExp(
    `(${EXPECTED_HTML}|${EXPECTED_CSS}|${EXPECTED_JSON})$`
  );

  // Separates changed file to "incorrectFiles" or "correctFiles"
  const fileCorrectness = changedFiles.reduce(
    (details, file) => {
      const detailsProperty = requiredFilesRegexp.test(file)
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

/* ---------------------------- File Based Checks --------------------------- */
const checkHTML = (file, fileContent, feedbackPush) => {
  const hasJS = /<script\b[^>]*>/i.test(fileContent);
  const hasCSS = fileContent.includes('.css');
  const hasCorrectStylesheet =
    /<link\s+[^>]*href=["']styles\.css["'][^>]*>/i.test(fileContent);

  // Exact file name check for HTML
  if (!file.includes(EXPECTED_HTML)) {
    feedbackPush(
      `Incorrect filename for \`${file}\`: please **rename** it as recommended`
    );
  }

  if (!fileContent) {
    feedbackPush(`Empty file, add the code for the file \`${file}\``);
  } else {
    // Check any JS content
    if (hasJS) {
      feedbackPush(`Remove **any JavaScript content** from your HTML file`);
    }

    // Check CSS link tag: exists or incorrect name
    if (!hasCSS) {
      feedbackPush(
        'Missing linked stylesheet file: link the CSS file to your HTML'
      );
    } else if (!hasCorrectStylesheet) {
      feedbackPush(
        'Incorrect stylesheet link: update the `href` so it points to the correct CSS file'
      );
    }
  }
};

const checkCSS = (file, fileContent, feedbackPush) => {
  // Exact file name check for CSS
  if (!file.includes(EXPECTED_CSS)) {
    feedbackPush(
      `Incorrect filename: please rename as recommended or remove if unnecessary`
    );
  }

  // CSS animation(s) check
  const hasCSSAnimation = /@keyframes/gi.test(fileContent);
  if (!fileContent) {
    feedbackPush(`Empty file, add the code for the file \`${file}\``);
  } else if (!hasCSSAnimation) {
    feedbackPush(
      'Missing animation: include at least one `@keyframes` definition and use the `animation` property'
    );
  }
};

const checkJSON = (file, fileContent, feedbackPush) => {
  // Exact file name check for JSON
  if (!file.includes(EXPECTED_JSON)) {
    feedbackPush(
      `Incorrect filename for \`${file}\`: please **rename** it as recommended`
    );
  }

  if (!fileContent) {
    feedbackPush(`Empty file, add the code for the file \`${file}\``);
  } else {
    // Meta checks ( artName & githubHandle )
    const contributorRegexp = new RegExp(CONTRIBUTOR_HANDLER, 'i');
    const hasMetaArtNameValue = /"artName":\s*".+"/gi.test(fileContent);
    const hasMetaGithubHandleValue = /"githubHandle"\s*:\s*".+?"/gi.test(
      fileContent
    );

    const hasCorrectMetaGithubHandle = contributorRegexp.test(fileContent);

    if (!hasMetaArtNameValue)
      feedbackPush('Missing `artName`: please include an `artName` value');

    if (hasMetaGithubHandleValue && !hasCorrectMetaGithubHandle) {
      feedbackPush(
        'Unmatched `githubHandle`: make sure it matches your GitHub username'
      );
    } else if (!hasMetaGithubHandleValue) {
      feedbackPush('Missing `githubHandle`: please add your GitHub username');
    }

    const linesCount = fileContent.trim().split('\n').length;
    const hasMoreProperties = linesCount > 4;
    if (hasMoreProperties) {
      feedbackPush(
        'Remove extra properties — only `githubHandle` and `artName` should be present'
      );
    }
  }
};

/* Project level reviews: checks file names, count, and paths */
const reviewOverallContribution = (contributionStates) => {
  const feedbackList = [];
  const feedbackPush = createFeedbackList(feedbackList, 'task');

  const { changedFiles, incorrectFiles } = contributionStates;

  // Content contained within `Art/`
  const artFolderFiles = changedFiles.filter((filename) =>
    filename.startsWith('Art/')
  );

  // Files count in Art
  const has3FilesInArt = artFolderFiles.length === 3;

  // Missing file contributions for any contributor or maintainer contributing with an animation
  const isMaintainerAsContributor =
    artFolderFiles.some((f) => f.startsWith('Art/')) && IS_MAINTAINER;
  if (!has3FilesInArt && (!IS_MAINTAINER || isMaintainerAsContributor)) {
    feedbackPush(
      `Missing files in your contribution: include all required files inside the \`Art/\` folder - (3 files expected)`
    );
  }

  // Handle incorrect files outside the Art/ folder for contributors
  const folderRegexp = new RegExp(`^Art/${CONTRIBUTOR_HANDLER}`, 'i');

  // Incorrect files context
  for (const file of incorrectFiles) {
    const isInContributorFolder = folderRegexp.test(file);
    const isInsideArtFolder = file.startsWith('Art/');

    const isIcon = file.includes('icon');
    const isPictural = /(png|jpe?g)$/.test(file);

    // Excludes html, css, json as they have their own checkers
    const isOveralCompliant = /(.html|.css|.json)/.test(file);

    let reason = '';
    // Checks files is inside or outside the "Art/<GITHUB_HANDLE>" folder
    if (isInContributorFolder) reason = 'not allowed for animations';
    if (!isInContributorFolder)
      reason = 'this should not be part of your contribution';

    // Checking pictural files cases
    if (isPictural && !isIcon)
      reason = 'pictures are not allowed, use online ones';
    if (isPictural && isIcon) reason = 'icons are auto-generated after merge';

    // User kind checks & context ( maintainer or contributor )
    const isContributorInsideArt = !IS_MAINTAINER && isInsideArtFolder;
    const isContributorOutsideArt = !IS_MAINTAINER && !isInsideArtFolder;
    const isMaintenerInsideArt = IS_MAINTAINER && isInsideArtFolder;

    const isFeedbackForUser =
      isContributorInsideArt || isContributorOutsideArt || isMaintenerInsideArt;
    // Push a Feedback for any above compliant cases
    if (!isOveralCompliant && isFeedbackForUser) {
      feedbackPush(`Remove unnecessary file: \`${file}\` - ${reason}`);
    }
  }
  if (feedbackList.length) feedbackList.unshift('\n- **Overall feedback**');
  return feedbackList;
};

/* File details reviews: checks all files and their content */
const checkContent = async (contributionStates) => {
  let feedbackList = [];
  const feedbackPush = createFeedbackList(feedbackList, 'task');

  // Files
  const { changedFiles } = contributionStates;
  const changedFilesWithSpace = changedFiles.filter((filename) =>
    /\s/.test(filename)
  );
  if (changedFilesWithSpace.length) {
    feedbackPush(
      'Space(s) detected in file or folder name(s) - please remove them'
    );
  }

  const changedFilesWithoutSpace = changedFiles.filter(
    (filename) => !/\s/.test(filename)
  );
  let HTMLReviews = [],
    CSSReviews = [],
    JSONReviews = [];

  // Files Checks
  for (const file of changedFilesWithoutSpace) {
    if (!file) continue;
    let fileContent = await fs.readFile(file, 'utf-8');

    const shouldSkip = /(.html|.css|.json)/.test(file);
    if (!fileContent && !shouldSkip) {
      feedbackPush(`Empty file, add content to your file \`${file}\``);
    } else {
      HTMLReviews = [
        ...HTMLReviews,
        ...(reviewFile(file, fileContent, checkHTML) || [])
      ];
      CSSReviews = [
        ...CSSReviews,
        ...(reviewFile(file, fileContent, checkCSS) || [])
      ];
      JSONReviews = [
        ...JSONReviews,
        ...(reviewFile(file, fileContent, checkJSON) || [])
      ];
    }
  }

  feedbackList = [
    ...feedbackList,
    ...HTMLReviews,
    ...CSSReviews,
    ...JSONReviews
  ];

  const overviewReviews = reviewOverallContribution(contributionStates);
  return [...overviewReviews, ...feedbackList];
};

/** Generates the final review message */
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

/** Automatically run the script */
(async () => {
  const contributionState = getContributionState();
  const feedbackList = await checkContent(contributionState);
  const PRFinalReview = generateReviewMessage(feedbackList);
  console.info(PRFinalReview);
})();
