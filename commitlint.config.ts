import type { UserConfig } from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting, no code change
        'refactor', // Code restructuring
        'perf',     // Performance improvement
        'test',     // Adding tests
        'build',    // Build system or dependencies
        'ci',       // CI configuration
        'chore',    // Maintenance
        'revert',   // Revert commit
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'web-dashboard',
        'api-gateway',
        'license-service',
        'auth-service',
        'telemetry-service',
        'websocket-service',
        'notification-service',
        'billing-service',
        'frontend-sdk',
        'backend-sdk',
        'shared-types',
        'ui',
        'eslint-config',
        'tsconfig',
        'logger',
        'encryption',
        'database',
        'config',
        'docker',
        'ci',
        'root',
      ],
    ],
    'scope-empty': [1, 'never'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
  },
};

export default config;
