const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 1. Habilitar explícitamente la resolución de enlaces simbólicos (symlinks)
config.resolver.unstable_enableSymlinks = true;

// 2. FUERZA a Metro a vigilar únicamente la carpeta actual, evitando que busque arriba
config.watchFolders = [__dirname];

module.exports = config;