const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    ww: path.resolve(__dirname, 'src/index.ts'),
    examples: path.resolve(__dirname, 'src/examples/index.tsx')
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
  },
  // devtool: 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/examples/index.ejs'
    }),
    new CopyPlugin({
      patterns: [
        'src/lib.js'
      ]
    })
  ],
  devServer: {
    hot: true,
    port: 8053,
    historyApiFallback: true
  }
}
