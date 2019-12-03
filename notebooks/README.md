# Jupyter Notebooks with TypeScript

This directory contains a simple configuration and documentation for using
the Jupyter notebook with TypeScript using the
[jp-babel](https://github.com/n-riesco/jp-babel) kernel. This kernel uses
[Babel](https://babeljs.io/) to transpile TypeScript code in a notebook to a
form that can be run by nodejs. Runtime typechecking is not done.

## Installation and configuration

1. Install the `jp-babel` npm package as a global npm package:

```
npm install -g jp-babel
```

2. Use the `jp-babel` command line to install the kernel:

```
jp-babel-install
```

3. Run `npm install` in this directory to install other dependencies:

```
npm install
```

At this point you should be able to launch JupyterLab:

```
jupyter lab
```

