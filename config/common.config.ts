const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    'ubirch-verification': path.resolve(__dirname, '../src/index.ts'),
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].min.js',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../demo/index.html'),
    }),
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
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
  devServer: {
    contentBase: path.join(__dirname, '../dist'),
    compress: true,
    port: 9102,
  },
};

export {};
