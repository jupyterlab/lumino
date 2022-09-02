/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

const path = require('path');
const fs = require('fs');
const utils = require('@jupyterlab/buildutils');

// Get the list of tags
const tags = utils.run('git tag', { stdio: 'pipe' }, true).split('\n');

// For each package, compare the local version to the published version
fs.readdirSync('packages').forEach(pkgName => {
  const localPath = path.join('packages', pkgName, 'package.json');
  const localPackage = JSON.parse(
    fs.readFileSync(localPath, { encoding: 'utf-8' })
  );
  const tag = `${localPackage.name}@${localPackage.version}`;
  if (tags.indexOf(tag) === -1) {
    utils.run(`git tag ${tag} -a -m "Release ${tag}"`);
  }
});
