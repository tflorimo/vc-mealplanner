import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  // setupFiles corre en cada worker ANTES de importar el código de app
  setupFiles:     ['<rootDir>/tests/integration/envSetup.ts'],
  globalSetup:    '<rootDir>/tests/integration/setup.ts',
  globalTeardown: '<rootDir>/tests/integration/teardown.ts',
  // runInBand se pasa por CLI: jest --runInBand (no es opción de Config)
  forceExit: true,
  testTimeout: 15000,
};

export default config;
