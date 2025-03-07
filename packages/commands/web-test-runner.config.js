/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

module.exports = {
  testFramework: {
    config: {
      forbidOnly: process.env.CI ? true : false,
      forbidPending: process.env.CI ? true : false,
    }
  }
};
