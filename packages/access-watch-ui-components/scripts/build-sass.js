// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

const path = require('path');
const fs = require('fs-extra');
const klawSync = require('klaw-sync');
const paths = require('../config/paths');
var sass = require('node-sass');

const sassFiles = klawSync(paths.libSrc, {filter: filterSassFiles, nodir: true});
const cssCmpntsPath = path.join(paths.appBuild, '/css');

sassFiles.forEach(({path}) => { buildCssFromSass(path); });

function filterSassFiles(item) {
  return item.path.endsWith('scss') || item.path.endsWith('sass');
}

function buildCssFromSass(sassFile) {
  const cmpntName = path.basename(sassFile, path.extname(sassFile));
  const {css} = sass.renderSync({file: sassFile});
  fs.outputFileSync(path.join(cssCmpntsPath, `${cmpntName}.css`), css);
}
