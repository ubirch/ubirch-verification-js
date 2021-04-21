module.exports = {
  mode: 'production',
  externals: {
    sha256: 'js-sha256',
    sha512: 'js-sha512',
  },
};

// https://medium.com/@muravitskiy.mail/cannot-redeclare-block-scoped-variable-varname-how-to-fix-b1c3d9cc8206
export {};
