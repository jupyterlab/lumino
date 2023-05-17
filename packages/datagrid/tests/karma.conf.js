/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

process.env.FIREFOX_BIN = require('playwright').firefox.executablePath();
process.env.FIREFOX_HEADLESS_BIN = process.env.FIREFOX_BIN;
process.env.WEBKIT_BIN = require('playwright').webkit.executablePath();
process.env.WEBKIT_HEADLESS_BIN = process.env.WEBKIT_BIN;

module.exports = function (config) {
  config.set({
    basePath: '.',
    frameworks: ['mocha'],
    reporters: ['mocha'],
    files: ['lib/bundle.test.js'],
    port: 9876,
    colors: true,
    singleRun: true,
    browserNoActivityTimeout: 30000,
    failOnEmptyTestSuite: false,
    logLevel: config.LOG_INFO
  });
};
