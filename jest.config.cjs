// jest.config.cjs
module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'mjs'],
  transform: {
    '^.+\\.mjs$': 'babel-jest',
    '^.+\\.js$': 'babel-jest',
  },
  coverageDirectory: 'coverage',
  collectCoverage: true,
};
