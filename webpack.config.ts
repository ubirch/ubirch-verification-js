const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = function (env) {
  const STAGE = env.STAGE || 'dev';
  const MODE = STAGE === 'prod' || STAGE === 'demo' ? 'production' : 'development';

  return {
    mode: MODE,
    entry: {
      "ubirch-verification": './src/verification.ts',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].min.js',
    },
    resolve: {
      extensions: ['.js', '.ts'],
      fallback: {
        "js-sha256": require.resolve("js-sha256"),
        "js-sha512": require.resolve("js-sha512"),
        "i18next": require.resolve("i18next"),
        "rxjs": require.resolve("rxjs")
      }
    },
    devtool: 'inline-source-map',
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      compress: true,
      port: 9102
    },
    plugins: [
      new CleanWebpackPlugin({cleanStaleWebpackAssets: false}),
      new HtmlWebpackPlugin(
        {
          filename: 'simple.html',
          template: './src/simple_verification.html'
        }),
    ],
    module: {
      rules: [
        {
          test: /\.ts?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ],
    },
  }
};
