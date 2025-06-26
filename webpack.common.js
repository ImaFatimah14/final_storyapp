// ==================== webpack.config.js (CopyWebpackPlugin) ====================
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src/scripts/index.js'),
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: process.env.NODE_ENV === 'production' ? '/Storyfati2/' : '/',
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg|ico)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/public/manifest.json'),
          to: 'manifest.json',
        },
        {
          from: path.resolve(__dirname, 'src/public/icons'),
          to: 'icons',
        },
        {
          from: path.resolve(__dirname, 'src/public/favicon.png'),
          to: 'favicon.png',
        },
        {
          from: path.resolve(__dirname, 'src/public/images'),
          to: 'images',
        },
        {
          from: path.resolve(__dirname, 'src/public/offline.html'),
          to: 'offline.html',
        },
      ],
    }),
  ],
};
