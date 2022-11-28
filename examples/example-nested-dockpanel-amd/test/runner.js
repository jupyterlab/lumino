/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

const puppeteer = require('puppeteer');

const url = `file://${process.cwd()}/index.html`;

(async () => {
  let success = true;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('error', err => {
    console.log('Error:  ', err);
    success = false;
  });
  page.on('pageerror', pageerr => {
    console.log('Page Error:  ', pageerr);
    success = false;
  });

  await page.goto(url, { timeout: 30000 });
  await browser.close();
  process.exit(success === true ? 0 : 1);
})();
