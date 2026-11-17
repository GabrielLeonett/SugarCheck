const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Mobile es un proyecto aislado: Metro solo vigila esta carpeta para no
// escanear backend/frontend del monorepo. La resolución de symlinks ya viene
// activada por defecto en Metro 0.83+.
config.watchFolders = [__dirname];

module.exports = config;
