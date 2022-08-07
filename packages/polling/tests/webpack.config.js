var path = require('path');

module.exports = {
  entry: './lib/index.spec.js',
  mode: 'development',
  output: {
    filename: './lib/bundle.test.js',
    path: path.resolve(__dirname)
  }
};
