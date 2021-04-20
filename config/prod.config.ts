module.exports = {
  mode: 'production',
  externals: {
    'js-sha256': 'js-sha256',
    'js-sha512': 'js-sha512',
    i18next: 'i18next',
    rxjs: 'rxjs',
  },
};

// https://medium.com/@muravitskiy.mail/cannot-redeclare-block-scoped-variable-varname-how-to-fix-b1c3d9cc8206
export {};
