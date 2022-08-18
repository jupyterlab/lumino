module.exports = {
  entryPoints: '.',
  entryPointStrategy: 'packages',
  exclude: ['examples/**', '**/tests/**', 'packages/default-theme'],
  includeVersion: true,
  name: '@lumino',
  out: 'docs/source/api',
  readme: 'none'
};
