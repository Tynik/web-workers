const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        examples: path.resolve(__dirname, 'src/index.tsx')
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
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
        extensions: ['.ts', '.tsx', '.js'],
        alias: {
            // https://github.com/facebook/react/issues/13991#issuecomment-435587809
            react: path.resolve('./node_modules/react')
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.PUBLIC_URL': JSON.stringify(process.env.PUBLIC_URL)
        }),
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
