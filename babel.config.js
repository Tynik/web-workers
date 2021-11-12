module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ],
  env: {
    test: {
      // https://github.com/facebook/jest/issues/936#issuecomment-821944391
      // https://www.npmjs.com/package/babel-plugin-explicit-exports-references
      plugins: ['explicit-exports-references']
    }
  }
};
