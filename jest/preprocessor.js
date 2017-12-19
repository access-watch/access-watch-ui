// This is just a copy paste of the babel-jest preprocessor with an
// extra check for ignoring webpack specific requires.

/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
const babel = require('babel-core');
const jestPreset = require('babel-preset-jest');

module.exports = {
  process(src, filename) {
    if (babel.util.canCompile(filename)) {
      return babel.transform(src, {
        auxiliaryCommentBefore: ' istanbul ignore next ',
        filename,
        presets: [jestPreset],
        retainLines: true,
      }).code;
    } else if (/\.(jpe?g|png|gif|svg|scss)$/.test(filename)) {
      // these files should not be handled
      return '';
    }
    return src;
  },
};
