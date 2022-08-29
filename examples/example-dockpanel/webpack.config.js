/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

var path = require('path');

module.exports = {
  entry: './build/index.js',
  mode: 'development',
  devtool: 'source-map',
  output: {
    path: __dirname + '/build/',
    filename: 'bundle.example.js',
    publicPath: './build/'
  },
  module: {
    rules: [
      { test: /\.js$/, use: ['source-map-loader'], enforce: 'pre' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.png$/, use: 'file-loader' }
    ]
  }
};
