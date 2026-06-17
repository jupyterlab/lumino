// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// Smoke test: the built example runs in Node and the two plugins activate,
// with the consumer printing the greeting provided by the producer.
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const { resolve } = require('node:path');

const entry = resolve(__dirname, '..', 'lib', 'index.js');
const output = execFileSync(process.execPath, [entry], { encoding: 'utf8' });

const expected = [
  '[hello] providing IGreeting',
  '[greeter] Hello, Jupyter! (from the hello plugin)'
];

for (const line of expected) {
  assert.ok(
    output.includes(line),
    `Expected output to include ${JSON.stringify(line)}, got:\n${output}`
  );
}

console.log('example-plugin-registry-server: smoke test passed');
