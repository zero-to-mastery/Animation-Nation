const fs = require('node:fs/promises');

const {
  README_LINK_MD,
  CONTRIBUTOR_HANDLER,
  PATTERN
} = require('./preReview.constants.js');

const {
  hasSpace,
  createFeedbackList,
  getContributionState
} = require('./preReview.helpers.js');

const {
  checkGlobally,
  checkHTML,
  checkCSS,
  checkJSON
} = require('./preReview.checkers.js');

const { reviewFile } = require('./preReview.reviewers.js');

/* -------------------------------------------------------------------------- */
/*                          Logic Orchestration Items                         */
/* -------------------------------------------------------------------------- */
/* File details reviews: checks all files and their content */
const reviewContribution = async (contributionStates) => {
  let feedbackList = [];
  const pushFeedback = createFeedbackList(feedbackList, 'task');

  // Files
  const { changedFiles, detailsPerExtension } = contributionStates;

  // Remaining files to process for html, css, json
  const handledFileCases = [
    ...detailsPerExtension.rejected.files,
    ...detailsPerExtension.images.files,
    ...detailsPerExtension.forbidden.files
  ];
  const processableFiles = changedFiles.filter((f) => {
    return !handledFileCases.includes(f);
  });
  const isRemainingToProcess = (f) => processableFiles.includes(f);

  // Gets valid files (in/out-side Art without spaces in name)
  const changedFilesWithoutSpace = processableFiles.filter(
    (filename) => !hasSpace(filename)
  );

  // Iterates through all files for scoped html,css,json file content details checks
  const filesReviews = { html: [], css: [], json: [] };
  for (const file of changedFilesWithoutSpace) {
    if (!file) continue;

    // Reads file
    let fileContent = '';
    try {
      fileContent = await fs.readFile(file, 'utf-8');
    } catch {
      continue;
    }

    // [ CASE ] Gives reviews for empty files other than expected one
    if (!fileContent) {
      pushFeedback(`Empty file, add content to your file \`${file}\``);
    }
    // [ CASE ] Gives reviews for scoped html, css, json files
    else if (isRemainingToProcess(file)) {
      [checkHTML, checkCSS, checkJSON].forEach((checkFileFn) => {
        const extension = checkFileFn.name.replace(/^check/i, '').toLowerCase();

        filesReviews[extension] = [
          ...filesReviews[extension],
          ...(reviewFile(file, fileContent, checkFileFn) || [])
        ];
      });
    }
  }

  feedbackList = [
    ...feedbackList,
    ...filesReviews.html,
    ...filesReviews.css,
    ...filesReviews.json
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

    messagePush(
      `> [!TIP] \n> _You can refer to ${README_LINK_MD} for additional guidance._`
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
(async () => {
  const contributionState = getContributionState();
  const feedbackList = await reviewContribution(contributionState);
  const PRFinalReview = generateReviewMessage(feedbackList);
  console.info(PRFinalReview);
})();
