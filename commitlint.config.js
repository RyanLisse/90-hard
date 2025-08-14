module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'repo',
        'app-shell',
        'core-tracking',
        'avatar',
        'weight',
        'fasting',
        'journal',
        'analytics',
        'gamification',
        'health',
        'infrastructure',
        'domain',
        'ui',
        'api',
        'docs',
        'deps',
      ],
    ],
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation only changes
        'style', // Changes that do not affect the meaning of the code
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf', // Code change that improves performance
        'test', // Adding missing tests or correcting existing tests
        'chore', // Changes to the build process or auxiliary tools
        'ci', // Changes to CI configuration files and scripts
        'revert', // Reverts a previous commit
        'wip', // Work in progress
      ],
    ],
  },
};
