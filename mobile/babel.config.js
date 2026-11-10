module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      // Expo already ships the React Native / web transforms. We disable its
      // built-in decorators plugin so we can run the TypeScript transform
      // before it (required by WatermelonDB's legacy decorators on web).
      ['babel-preset-expo', { decorators: false }],
    ],
    overrides: [
      {
        test: /\.ts$/,
        plugins: [
          ['@babel/plugin-transform-typescript', { isTSX: false, allowNamespaces: true }],
          ['@babel/plugin-proposal-decorators', { legacy: true }],
        ],
      },
      {
        test: /\.tsx$/,
        plugins: [
          ['@babel/plugin-transform-typescript', { isTSX: true, allowNamespaces: true }],
          ['@babel/plugin-proposal-decorators', { legacy: true }],
        ],
      },
    ],
  };
};
