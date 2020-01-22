var path = require('path');

module.exports = {
  entry: './build/index.spec.js',
  mode: 'development',
  output: {
    filename: './build/bundle.test.js',
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
}
