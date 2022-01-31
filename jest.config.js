/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['lambdas/middlewares/*', 'lambdas/utils/*', 'lambdas/test-data/*']
};
