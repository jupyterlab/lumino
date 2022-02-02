// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2019, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

import * as fs from 'fs';

import * as http from 'http';

import * as path from 'path';

/**
 * Create a HTTP static file server for serving the static
 * assets to the user.
 */
let server = http.createServer((request, response) => {
  console.log('request starting...');

  let filePath = '.' + request.url;
  if (filePath == './') {
    filePath = './index.html';
  }

  let extname = path.extname(filePath);
  let contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      console.error(`Could not find file: ${filePath}`);
      response.writeHead(404, { 'Content-Type': contentType });
      response.end();
    } else {
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });
});

// Start the server
server.listen(8000, () => {
  console.info(new Date() + ' Page server is listening on port 8000');
});
