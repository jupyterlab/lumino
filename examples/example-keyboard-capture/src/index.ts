// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2019, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

import { Panel, Widget } from '@lumino/widgets';
import { CaptureWidget } from './capture';
import { OutputWidget } from './output';

import '../style/index.css';

/**
 * Initialize the applicaiton.
 */
async function init(): Promise<void> {
  // Add the text editors to a dock panel.
  let capture = new CaptureWidget();
  let output = new OutputWidget();

  capture.node.textContent =
    'Focus me and hit each key on your keyboard without any modifiers';

  // Add the dock panel to the document.
  let box = new Panel();
  box.id = 'main';
  box.addWidget(capture);
  box.addWidget(output);

  capture.dataAdded.connect((sender, entry) => {
    output.value = `Added ${entry.type}: ${
      entry.code ? `${entry.code} →` : ''
    } <kbd>${entry.key}</kbd>`;
  });
  output.action.connect((sender, action) => {
    if (action === 'clipboard') {
      navigator.clipboard.writeText(capture.formatMap());
    } else if (action === 'clear') {
      capture.clear();
      output.value = ' ';
    } else {
      output.value = `<pre>${capture.formatMap()}</pre>`;
    }
  });

  window.onresize = () => {
    box.update();
  };
  Widget.attach(box, document.body);
}

window.onload = init;
