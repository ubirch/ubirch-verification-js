const nodePaths256 = ['js-sha256/', 'sha256'];
const nodePaths512 = ['js-sha512/', 'sha512'];

module.exports = {
  mode: 'production',
  externals: {
    'js-sha256': {
      commonjs: nodePaths256,
      commonjs2: nodePaths256,
      amd: nodePaths256,
      root: ['sha256'],
    },
    'js-sha512': {
      commonjs: nodePaths512,
      commonjs2: nodePaths512,
      amd: nodePaths512,
      root: ['sha512'],
    },
  },
};

export {};
