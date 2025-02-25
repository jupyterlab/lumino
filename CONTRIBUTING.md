# Contributing to Lumino

Lumino is a subproject of Project Jupyter and subject to the [Jupyter governance](https://github.com/jupyter/governance) and [Code of conduct](https://github.com/jupyter/governance/blob/master/conduct/code_of_conduct.md).

## General Guidelines

For general documentation about contributing to Jupyter projects, see the [Project Jupyter Contributor Documentation](https://jupyter.readthedocs.io/en/latest/contributing/content-contributor.html).

## Setting up a development environment

Lumino requires [nodejs](https://nodejs.org/en/) and [yarn](https://yarnpkg.com/lang/en/) for local development. After
cloning Lumino, run the following to install dependencies and build the source:

```bash
yarn
yarn build:src
```

## Tests

The tests are written using [web-test-runner](https://modern-web.dev/docs/test-runner/overview/)
to test in browser environment (provided by [playwright](https://playwright.dev/)).

If you have never installed playwright before or updated it, you need to install the browsers
by executing:

```bash
yarn playwright install
```

To run the tests, run:

```bash
yarn build:test
yarn test  # optionally test:chromium, test:firefox, or test:webkit
```

You can run the tests manually to debug them by going inside one package (e.g. `packages/application`)
and then executing `yarn test:debug`. This should open your browser
in which you will be able to select the test file to execute.
The outcome of the tests are displayed in the web browser console and you
can use the web browser debug capability to debug the tests.

> [!NOTE]
> The test files are transpiled and bundled before execution. Therefore
> when debugging in the browser, you must use the file `tests/lib/bundle.test.js`.
> Then you will need to apply the fix to the Typescript test file and re-run
> the test command (to trigger the bundling) to check the test is fixed.

## Examples

Lumino examples are in the `examples/` folder. To build and run an example:

```bash
yarn build:src
yarn minimize
yarn build:examples
cd example/dockpanel
```

Open the `index.html` file in a browser to see the running example.

There are also tests in some of the examples. These can be run as:

```bash
yarn test:examples
```

## Static Examples

There are static examples built into the documentation. Having them in docs allows us to test examples
in the ReadTheDocs build for a PR.

To add an example to the static examples:

- Add appropriate link in: `docs/source/examples.rst`
- Add the example name to the `EXAMPLES` in `docs/source/conf.py`
- Add `ignore-links` config in `package.json`

## Documentation

The documentation is built with [sphinx](https://www.sphinx-doc.org/en/master/)
making use of the [PyData Sphinx theme](https://pydata-sphinx-theme.readthedocs.io/en/stable/index.html).

To build it locally
- create and activate an isolated development environment with the necessary dependencies
with
```bash
conda env create -f docs/environment.yml
conda activate lumino_documentation
```
- build, for example the html version, with
```bash
cd docs
make html
```
The HTML pages are then located in the `build/html` directory.