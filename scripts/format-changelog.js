/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

const path = require('path');
const fs = require('fs');
const utils = require('@jupyterlab/buildutils');
const versions = [];

let changelog = fs.readFileSync('CHANGELOG.md', { encoding: 'utf-8' });
const firstIndex = changelog.indexOf('<!-- <START NEW CHANGELOG ENTRY> -->');
const lastIndex = changelog.indexOf('<!-- <END NEW CHANGELOG ENTRY> -->');
const entry = changelog.slice(firstIndex, lastIndex);

// For each package, compare the local version to the published version
fs.readdirSync('packages').forEach(pkgName => {
  const localPath = path.join('packages', pkgName, 'package.json');
  const localPackage = JSON.parse(
    fs.readFileSync(localPath, { encoding: 'utf-8' })
  );
  const name = localPackage.name;
  const version = localPackage.version;
  const remoteVersion = utils.run(
    `npm info ${name} version`,
    { stdio: 'pipe' },
    true
  );
  if (version !== remoteVersion) {
    versions.push(`    ${name}: ${remoteVersion} => ${version}`);
  }
});

// Splice the entry
if (versions) {
  const lines = entry.split('\n');
  let index = -1;
  lines.forEach((line, i) => {
    if (line.startsWith('([Full Changelog]')) {
      index = i + 1;
    }
  });
  if (index != -1) {
    const newEntry = lines
      .slice(0, index)
      .concat([''], versions, lines.slice(index, -1), ['']);
    changelog = changelog.replace(entry, newEntry.join('\n'));
  }
}

fs.writeFileSync('CHANGELOG.md', changelog, { encoding: 'utf-8' });
