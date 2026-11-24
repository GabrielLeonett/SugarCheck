module.exports = function (api) {
  api.cache(true);

  // Desde SDK 58 el preset de Expo ya incluye los transforms de TypeScript y
  // decoradores (WatermelonDB). Los `overrides` con `test` por regex que había
  // antes rompen el cálculo de cache de Metro ("no filename was passed to Babel").
  return {
    presets: ['babel-preset-expo'],
  };
};
