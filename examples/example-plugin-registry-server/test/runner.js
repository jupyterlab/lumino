// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const { resolve } = require('node:path');
const { test } = require('node:test');

test('runs the plugin registry on the server', () => {
  const entry = resolve(__dirname, '..', 'lib', 'index.js');
  const result = spawnSync(process.execPath, [entry], { encoding: 'utf8' });

  assert.ifError(result.error);
  assert.strictEqual(
    result.status,
    0,
    `Expected exit code 0, got ${result.status}. stderr:\n${result.stderr}`
  );
  assert.strictEqual(result.stderr, '');
  assert.deepStrictEqual(result.stdout.trim().split(/\r?\n/), [
    '[hello] providing IGreeting',
    '[greeter] Hello, Jupyter! (from the hello plugin)'
  ]);
});
