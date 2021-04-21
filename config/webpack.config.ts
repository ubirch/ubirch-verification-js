const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const common = require('./common.config');
const dev = require('./dev.config');
const prod = require('./prod.config');

module.exports = function (env) {
  const STAGE = env.STAGE || 'dev';
  const MODE = STAGE === 'prod' || STAGE === 'demo' ? 'production' : 'development';

  switch (MODE) {
    case 'development':
      return merge(common, dev);
    case 'production':
      return merge(common, prod);
    default:
      return merge(common, dev);
  }
};
