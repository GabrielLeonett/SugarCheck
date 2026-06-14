export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.', // Indica que busque en todo el proyecto
  testRegex: '.*\\.spec\\.ts$', // Esto buscará todos tus archivos .spec.ts
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@faker-js)/)"
  ],
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  // Esto ayuda a que Jest encuentre tus módulos si usas paths en el tsconfig
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};