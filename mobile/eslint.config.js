// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*'],
  },
  {
    // SDK 58 activa las reglas del React Compiler como errores. El código existente
    // tiene patrones válidos que esas reglas marcan; las dejamos como avisos para
    // no bloquear el lint mientras se migran de forma gradual.
    rules: {
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
    },
  },
  {
    // Los enums de expo-notifications se reexportan a través de `export *` y el
    // resolver de ESLint no los ve, aunque existen en runtime y tipos.
    files: ['src/notifications/reminders.ts'],
    rules: {
      'import/namespace': 'off',
    },
  },
]);
