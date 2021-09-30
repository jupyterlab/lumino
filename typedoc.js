const fs = require('fs');
const path = require('path');

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path + '/' + file).isDirectory();
  });
}

const packages = getDirectories(path.join(__dirname, 'packages'));

const entryPoints = packages
  .flatMap(p => [`packages/${p}/src/index.ts`, `packages/${p}/src/index.tsx`])
  .filter(function (path) {
    return fs.existsSync(path);
  });

const exclude = packages.flatMap(p => [`packages/${p}/tests`]);

module.exports = {
  entryPoints,
  exclude,
  name: '@lumino',
  out: 'docs/source/api',
  // json: 'docs/source/api.json',
  readme: 'README.md',
  theme: 'typedoc-theme',
  tsconfig: 'tsconfigdoc.json'

  // theme: minimal,
  // excludePrivate: true,
  // excludeProtected: true,
  // excludeExternals: true,
  // hideGenerator: true

  // gitRevision: 'master',
  // 'sourcefile-url-prefix': `https://github.com/sinnerschrader/feature-hub/tree/${git.short()}/packages/`,
};
