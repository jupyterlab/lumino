# Contributing to Lumino

Lumino is a subproject of Project Jupyter and subject to the [Jupyter governance](https://github.com/jupyter/governance) and [Code of conduct](https://github.com/jupyter/governance/blob/master/conduct/code_of_conduct.md).

## General Guidelines

For general documentation about contributing to Jupyter projects, see the [Project Jupyter Contributor Documentation](https://jupyter.readthedocs.io/en/latest/contributing/content-contributor.html).

## Setting up a development environment

Lumino requires [nodejs](https://nodejs.org/en/) and [yarn](https://yarnpkg.com/lang/en/) for local development.  After
cloning Lumino, run the following to install dependencies and build the source:

```bash
yarn
yarn build:src
```

## Tests

The tests are written using karma to simulate a browser environment.

To run the tests, run:

```bash
yarn build:test
yarn test  # optionally test:chrome, test:firefox, or test:ie
```

## Examples

Lumino examples are in the `examples/` folder.  To build and run an example:

```bash
yarn build:src
yarn minimize
yarn build:examples
cd example/dockpanel
```

Open the `index.html` file in a browser to see the running example.

There are also tests in some of the examples.  These can be run as:

```bash
yarn test:examples
```
