const fs = require('node:fs/promises')
const path = require('node:path/posix')

const {
  CHANGED_FILES_STR,
  EXISTING_FORBIDDEN,
  IS_MAINTAINER,
  PATTERN
} = require('./preReview.constants.js');

/* ------------------------------- Predicates ------------------------------- */

const doesStartWithArt = (f) => f.startsWith('Art/');
const isValidFolderName = (f) => PATTERN.folderUsername.test(f);
const isExpectedFileName = (filename, expectedFilename) =>
  filename.endsWith(expectedFilename);
const hasSpace = (f) => /\s/g.test(f);
const isForbidden = (f) =>
  EXISTING_FORBIDDEN.some((forbidden) => f.startsWith(forbidden));
/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

/* ------------------------------- Uilitaries ------------------------------- */
const extractFileExtension = (f) =>
  f.match(PATTERN.extension.self)?.[0]?.slice(1) || '';

/** Create a feedbackList to format inputs based on `mode` (line | task) */
const createFeedbackList = (feedbackList = [], mode = 'line') => {
  return (message) => {
    const feedback = mode == 'task' ? `\t> - [ ] ${message}` : message;
    feedbackList.push(feedback);
  };
};
/* ------------------------------------ - ----------------------------------- */

/** Establishes a state about the contribution
 * - correctFiles: any file matching file naming
 * - incorrectFiles: any file not matching file naming
 */
const getContributionState = () => {
  /** All changed files detected */
  const changedFiles = CHANGED_FILES_STR.split('\n') || [];

  /** Separates all changed files to "incorrectFiles" or "correctFiles"
   * - "correctFiles": file paths matching requirements - to skip
   * - "incorrectFiles": file paths not matching requirements - to review
   */
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

  // Count status on all changed files ( inside / outside Art )
  const detailsPerExtension = changedFiles.reduce(
    (details, f) => {
      if (isForbidden(f) && !IS_MAINTAINER) {
        details.forbidden.count += 1;
        details.forbidden.files.push(f);
      } else if (doesStartWithArt(f)){
        if (f.endsWith('html')) details.html += 1;
        else if (f.endsWith('css')) details.css += 1;
        else if (f.endsWith('json')) details.json += 1;
        const pathFolder = path.parse(f).dir
        if(!details.contributionFolders.folders.includes(pathFolder)){
          details.contributionFolders.count += 1
          details.contributionFolders.folders.push(pathFolder)
        }
      } else if (PATTERN.extension.images.test(f)) {
        details.images.count += 1;
        details.images.files.push(f);
      } else {
        details.rejected.count += 1;
        details.rejected.files.push(f);
      }

      return details;
    },
    {
      html: 0,
      css: 0,
      json: 0,
      contributionFolders: { count: 0, folders: []},
      images: { count: 0, files: [] },
      rejected: { count: 0, files: [] },
      forbidden: { count: 0, files: [] }
    }
  );

  const state = {
    changedFiles,
    ...fileCorrectness,
    detailsPerExtension
  };
  return state;
};

module.exports = {
  doesStartWithArt,
  isValidFolderName,
  isExpectedFileName,
  hasSpace,
  isForbidden,
  extractFileExtension,
  createFeedbackList,
  getContributionState
};
