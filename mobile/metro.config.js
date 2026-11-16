const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// FUERZA a Metro a vigilar únicamente la carpeta actual, evitando que busque arriba.
// (unstable_enableSymlinks ya es el valor por defecto en SDK 58)
config.watchFolders = [__dirname];

module.exports = config;