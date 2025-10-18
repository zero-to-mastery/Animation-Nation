const { EXPECTED_FILE, IS_MAINTAINER } = require('./preReview.constants');

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

/* ---------------- Feedback review helpers - individual file --------------- */

/** Gives feedback on empty files if necessary and returns if has empty file  */
const reviewEmptyFileFeedback = (file, fileContent, pushFeedbackFn) => {
  const isEmpty = !fileContent.trim();
  if (isEmpty) {
    pushFeedbackFn(`Empty file, add the code for the file \`${file}\``);
  }
  return isEmpty;
};

/** Gives feedback on file name not correctly as expected  */
const reviewExpectedFileFeedback = (file, extectedFile, pushFeedbackFn) => {
  const isCorrectFileName = isExpectedFileName(file, extectedFile);
  if (!isCorrectFileName) {
    pushFeedbackFn(
      `Incorrect filename: please rename as recommended or remove if unnecessary`
    );
  }
  return isCorrectFileName;
};

/* ----------------- Feedback review main - individual file ----------------- */

/** Gives feedback common specs (filename, empty files, ...)*/
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

/* ----------------- Feedback review helpers - folder level ----------------- */

/** Gives feedback for folder contribution missing files */
const reviewOveralFolders = (contributionStates, pushFeedback) => {
  const { changedFiles, detailsPerExtension } = contributionStates;
  const { count, folders } = detailsPerExtension.contributionFolders;

  const expectedExtensions = ['html', 'css', 'json'];

  // Organises files per folders
  const splittedChangesPerFolders = folders.map((folderName) => {
    const folderFiles = [];
    const missings = [];

    // Pushes files to corresponding folder
    for (let file of changedFiles) {
      if (file.includes(folderName)) folderFiles.push(file);
    }

    for (let ext of expectedExtensions) {
      if (!folderFiles.toString().includes(ext)) {
        missings.push(ext);
      }
    }
    return {
      name: folderName,
      files: folderFiles,
      missings
    };
  });

  // Message processing
  const incompleteFolders = splittedChangesPerFolders.filter(
    (details) => !!details.missings.length
  );
  if (!!incompleteFolders.length) {
    const messages = incompleteFolders.map((folder) => {
      const accordedFileText = folder.missings.length > 1 ? 'files' : 'file';
      const extensionsText = folder.missings
        .map((ext) => `\`${ext}\``)
        .join(', ');
      return `\n\t\t- please add the missing ${extensionsText} ${accordedFileText} in the folder \`${folder.name}\``;
    });

    let formattedReviewStr = '';
    if (messages.length) {
      messages.unshift(
        `Missing in ${incompleteFolders.length} of the ${count} contributions folders`
      );
      formattedReviewStr = messages.join('');
    }

    if (formattedReviewStr) {
      pushFeedback(formattedReviewStr);
    }
  }
};

/** Gives feedback on forbidden changes (any changes outside Art/ folder) */
const reviewOveralForbiddenChanges = (detailsPerExtension, pushFeedback) => {
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
};

/** Gives feedback rejected files (files with un-scoped extension and is not image ) */
const reviewOveralRejectedFiles = (detailsPerExtension, pushFeedback) => {
  const files = detailsPerExtension.rejected.files;
  if (!IS_MAINTAINER) {
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
};

/** Gives feedback on contribution containing space in folder / file names */
const reviewOveralSpaceInFileNames = (detailsPerExtension, pushFeedback) => {
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
};

/** Gives feedback on contribution containing any pictural file */
const reviewOveralPicturalFiles = (detailsPerExtension, pushFeedback) => {
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
};

/* ---------------------------------- MAIN ---------------------------------- */

const reviewOverallFiles = (contributionStates, pushFeedback) => {
  const { changedFiles, detailsPerExtension } = contributionStates;
  const artFolderFiles = changedFiles.filter(doesStartWithArt);

  // [ CASES ] Reviews for unhandled file ( files not html, css. html ) - shortcuts cases - not reviewed
  const reviewOveralArgs = [detailsPerExtension, pushFeedback];
  reviewOveralFolders(contributionStates, pushFeedback);
  reviewOveralForbiddenChanges(...reviewOveralArgs);
  reviewOveralRejectedFiles(...reviewOveralArgs);
  reviewOveralSpaceInFileNames(...reviewOveralArgs);
  reviewOveralPicturalFiles(...reviewOveralArgs);

  return artFolderFiles;
};

module.exports = {
  reviewFile,
  reviewFileSpecs,
  reviewOverallFiles
};
