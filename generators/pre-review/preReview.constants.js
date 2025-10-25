/* Github Actions values to use */
const CONTRIBUTOR_HANDLER = process.env.CONTRIBUTOR || '';

const CHANGED_FILES_STR = process.env?.CHANGED_FILES || '';

const IS_MAINTAINER = ['admin', 'maintain'].includes(
  process.env?.GITHUB_PERMISSION_ROLE || ''
);

/** Unauthorised folders and files changes ( compared using startsWith on file path)  */
const EXISTING_FORBIDDEN = [
  '.github/',
  'generators/',
  'public/',
  'index.html',
  'index.html',
  'package.json',
  'package-lock.json'
];

/** Required file in Art folder */
const EXPECTED_FILE = {
  html: 'index.html',
  css: 'styles.css',
  json: 'meta.json'
};

const README_LINK_MD =
  '[README.md](https://github.com/zero-to-mastery/Animation-Nation/blob/master/README.md)';
const EXPECTED_FILE_COUNT = Object.keys(EXPECTED_FILE).length;

/** Patterns helper for checks */
const PATTERN = {
  folderUsername: new RegExp(`^Art/${CONTRIBUTOR_HANDLER}`, 'i'),
  requiredFiles: new RegExp(
    `(${EXPECTED_FILE.html}|${EXPECTED_FILE.css}|${EXPECTED_FILE.json})$`
  ),
  folderArtPath: new RegExp(`^Art/${CONTRIBUTOR_HANDLER}[-_]\w+.`, 'i'),
  extension: {
    self: /\.\w+$/,
    expected: /\.(html|css|json)$/,
    images: /\.(png|jpe?g|gif|tif|svg)$/,
    fonts: /\.(ttf|woff|otf|eot)$/
  },
  handleExceptions: {
    js: /\.js$/
    // pictural:
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
};

module.exports = {
  README_LINK_MD,
  CONTRIBUTOR_HANDLER,
  CHANGED_FILES_STR,
  IS_MAINTAINER,
  EXISTING_FORBIDDEN,
  EXPECTED_FILE,
  EXPECTED_FILE_COUNT,
  PATTERN
};
