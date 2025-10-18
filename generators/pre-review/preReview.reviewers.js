const { EXPECTED_FILE } = require('./preReview.constants');

const {
  hasSpace,
  isExpectedFileName,
  doesStartWithArt,
  createFeedbackList,
  extractFileExtension
} = require('./preReview.helpers');

/** Review contribution files  */
const reviewFile = (file, fileContent, checkerFn) => {
  const feedbackList = [];
  if (!checkerFn) return feedbackList;

  let extension = checkerFn.name.replace(/^check/i, '').toLowerCase();
  if (!file.endsWith(`.${extension}`)) return feedbackList;

  const pushFeedback = createFeedbackList(feedbackList, 'task');
  checkerFn(file, fileContent, pushFeedback);

  // Prepends feedback header if any feedback items
  if (feedbackList.length) {
    const headerReview = `\n- **${extension.toUpperCase()} feedback for _\`${file}\`_**`;
    feedbackList.unshift(headerReview);
  }

  return feedbackList;
};

/* --------------------------- Feedback checkers --------------------------- */

/** Gives feedback on empty files if necessary and returns if has empty file  */
const reviewEmptyFileFeedback = (file, fileContent, pushFeedbackFn) => {
  const isEmpty = !fileContent.trim();
  if (isEmpty) {
    pushFeedbackFn(`Empty file, add the code for the file \`${file}\``);
  }
  return isEmpty;
};

const reviewExpectedFileFeedback = (file, extectedFile, pushFeedbackFn) => {
  const isCorrectFileName = isExpectedFileName(file, extectedFile);
  if (!isCorrectFileName) {
    pushFeedbackFn(
      `Incorrect filename: please rename as recommended or remove if unnecessary`
    );
  }
  return isCorrectFileName;
};

const reviewFileSpecs = (file, fileContent, pushFeedback) => {
  // [ CASE ] Gives feedback on expected and incorrect file name
  const fileExtension = extractFileExtension(file);
  if (fileExtension) {
    reviewExpectedFileFeedback(
      file,
      EXPECTED_FILE?.[fileExtension],
      pushFeedback
    );
  }

  // [ CASE ] Gives feedback on empty file and shortcuts if this is the case
  const isEmptyFile = reviewEmptyFileFeedback(file, fileContent, pushFeedback);
  const shouldContinue = !isEmptyFile;
  return shouldContinue;
};

const reviewOverallFiles = (contributionStates, pushFeedback) => {
  const { changedFiles, detailsPerExtension } = contributionStates;
  const artFolderFiles = changedFiles.filter(doesStartWithArt);

  // [ CASES ] Reviews for unhandled file ( files not html, css. html ) - shortcuts cases - not reviewed
  const reviewOveralArgs = [detailsPerExtension, pushFeedback];
  reviewOveralForbiddenChanges(...reviewOveralArgs);
  reviewOveralRejectedFiles(...reviewOveralArgs);
  reviewOveralSpaceInFileNames(...reviewOveralArgs);
  reviewOveralPicturalFiles(...reviewOveralArgs);

  return artFolderFiles;
};

/** OK - Reviews for forbidden changes */
function reviewOveralForbiddenChanges(detailsPerExtension, pushFeedback) {
  const messages = detailsPerExtension.forbidden.files.map(
    (f) => `\n\t\t- please remove any changes in \`${f}\``
  );

  let formattedReviewStr = '';
  if (messages.length) {
    messages.unshift('Unauthorised changes:');
    formattedReviewStr = messages.join('');
  }

  if (formattedReviewStr) {
    pushFeedback(formattedReviewStr);
  }
}

// other file in art than html, css, json
function reviewOveralRejectedFiles(detailsPerExtension, pushFeedback) {
  const files = detailsPerExtension.rejected.files;
  const messages = files.map(
    (f) => `\n\t\t- please remove the invalid file \`${f}\``
  );

  let formattedReviewStr = '';
  if (messages.length) {
    messages.unshift('Non-accepted files:');
    formattedReviewStr = messages.join('');
  }

  if (formattedReviewStr) {
    pushFeedback(formattedReviewStr);
  }
}

function reviewOveralSpaceInFileNames(detailsPerExtension, pushFeedback) {
  const fileWithSpace = detailsPerExtension.rejected.files.filter(hasSpace);
  const messages = fileWithSpace.map(
    (f) => `\n\t\t- please remove spaces in \`${f}\``
  );

  let formattedReviewStr = '';
  if (messages.length) {
    messages.unshift('Space(s) detected in file or folder name(s):');
    formattedReviewStr = messages.join('');
  }

  if (formattedReviewStr) {
    pushFeedback(formattedReviewStr);
  }
}

function reviewOveralPicturalFiles(detailsPerExtension, pushFeedback) {
  const picturalFiles = detailsPerExtension.images.files;

  const isOtherThanIcon = (f) => !f.includes('icon');

  const messages = picturalFiles.map((f) => {
    return isOtherThanIcon(f)
      ? `\n\t\t- pictures are not allowed, use online ones, please remove \`${f}\``
      : `\n\t\t- icons are auto-generated after merge, please remove \`${f}\``;
  });

  let formattedReviewStr = '';
  if (messages.length) {
    messages.unshift('Images files detected in contribution:');
    formattedReviewStr = messages.join('');
  }

  if (formattedReviewStr) {
    pushFeedback(formattedReviewStr);
  }
}

module.exports = {
  reviewFile,
  reviewFileSpecs,
  reviewOverallFiles
};

// // Identifies changed files inside or outside art
// let changedInOutArtProp = doesStartWithArt(f) ? 'changesInArt' : 'changesOutArt'
// details[changedInOutArtProp].count += 1
// details[changedInOutArtProp].files.push(f)
