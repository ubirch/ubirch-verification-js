const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    'ubirch-verification': path.resolve(__dirname, '../src/verification.ts'),
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].min.js',
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new HtmlWebpackPlugin({
      filename: 'simple.html',
      template: path.resolve(__dirname, '../src/simple_verification.html'),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};

export {};
