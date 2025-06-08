import oclif from 'eslint-config-oclif';

export default [
  {
    ignores: [
      'node_modules/',
      'dist/',
      'tmp/',
      'package/',
      'reports/',
      'new/',
      'save/',
      'telegraf/',
      '*.tgz',
      '*.log',
      'test/',
      'coverage/',
      '.nyc_output/',
      'lib/',
      'build/',
      '**/*.d.ts',
      '**/*.js.map',
      '*.config.js',
      '*.config.ts',
      'bin/run.js',
      'bin/dev.js',
      '**/*.test.ts',
      '**/*.test.js',
      '**/__fixtures__/**',
      '**/fixtures/**',
      '**/*.spec.ts',
      '**/*.spec.js'
    ]
  },
  {
    files: ['src/**/*.ts'],
    ignores: [
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/__fixtures__/**',
      '**/fixtures/**',
      '**/*.d.ts'
    ]
  },
  ...oclif,
  {
    rules: {
      'no-useless-constructor': 'off',
      indent: ['warn', 2],
      'lines-between-class-members': 'off',
      'comma-dangle': 'off',
      '@typescript-eslint/camelcase': 'off'
    }
  }
]; 