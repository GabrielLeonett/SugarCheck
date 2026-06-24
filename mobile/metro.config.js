const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 1. Habilitar explícitamente la resolución de enlaces simbólicos (symlinks)
config.resolver.unstable_enableSymlinks = true;

// 2. (Opcional) Si usas un monorepo, descomenta la siguiente línea para vigilar todo el espacio de trabajo:
// config.watchFolders = [__dirname + '/../..']; 

module.exports = config;