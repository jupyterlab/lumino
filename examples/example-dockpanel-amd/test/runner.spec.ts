/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

import { ConsoleMessage, expect, test } from '@playwright/test';

const URL = `file://${process.cwd()}/index.html`;

test.setTimeout(120000);

test('should load the example', async ({ page }) => {
  console.info('Navigating to page:', URL);
  let success = true;

  const handleMessage = async (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      console.log('Error:  ', msg.text());
      success = false;
    }
  };

  page.on('console', handleMessage);

  await page.goto(URL);

  await page.waitForLoadState('networkidle');

  expect(success).toEqual(true);
});
