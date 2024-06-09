/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 60000,
  forceExit: true,
  setupFiles: ['<rootDir>/tests/setEnvVars.ts'],
};