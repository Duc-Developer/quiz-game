const path = require('path');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');
const dotenv = require('dotenv');
const env = require('dotenv').config().parsed;

module.exports = {
    mode: 'development',
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, 'build/index.js'),
        filename: 'index.js'
    },
    optimization: {
        minimize: true
    },
    resolve: {
        modules: [path.join(__dirname, 'src'), 'node_modules']
    },
    plugins: [
        new Dotenv()
      ]
};