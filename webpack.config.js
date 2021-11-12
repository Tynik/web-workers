const path = require('path');

module.exports = {
  entry: {
    ww: path.resolve(__dirname, 'src/index.ts'),
    // lib: path.resolve(__dirname, 'src/lib.js')
  },
  output: {
    path: path.resolve(__dirname, 'data')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  }
}
