/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

var path = require('path');

module.exports = {
  entry: './lib/index.spec.js',
  mode: 'development',
  output: {
    filename: './lib/bundle.test.js',
    path: path.resolve(__dirname)
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
