const path = require('path');

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
        "js-sha512": require.resolve("js-sha512")
      }
    },
    devtool: 'inline-source-map',
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      compress: true,
      port: 9102
    },
    plugins: [],
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
