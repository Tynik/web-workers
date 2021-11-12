const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    examples: path.resolve(__dirname, 'src/index.tsx')
  },
  output: {
    path: path.resolve(__dirname, 'dist')
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
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        'node_modules/@tynik/web-workers/dist/worker.worker.js'
      ]
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.ejs'
    })
  ],
  devServer: {
    hot: true,
    port: 8053,
    historyApiFallback: true
  }
}
