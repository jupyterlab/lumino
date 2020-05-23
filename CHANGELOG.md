# Change Log

All notable changes to this project will be documented in this file.

## 2020-05-23

 - @lumino/algorithm: 1.2.0 => 1.3.0
 - @lumino/application: 1.9.0 => 1.10.0
 - @lumino/collections: 1.2.0 => 1.3.0
 - @lumino/commands: 1.10.0 => 1.11.0
 - @lumino/coreutils: 1.4.0 => 1.5.0
 - @lumino/datagrid: 0.7.0 => 0.8.0
 - @lumino/datastore: 0.9.0 => 0.10.0
 - @lumino/default-theme: 0.3.0 => 0.4.0
 - @lumino/disposable: 1.3.0 => 1.4.0
 - @lumino/domutils: 1.1.0 => 1.2.0
 - @lumino/dragdrop: 1.5.0 => 1.6.0
 - @lumino/keyboard: 1.1.0 => 1.2.0
 - @lumino/messaging: 1.3.0 => 1.4.0
 - @lumino/polling: 1.2.0 => 1.3.0
 - @lumino/properties: 1.1.0 => 1.2.0
 - @lumino/signaling: 1.3.0 => 1.4.0
 - @lumino/virtualdom: 1.6.0 => 1.7.0
 - @lumino/widgets: 1.12.0 => 1.13.0

 - Add UMD support [#40](https://github.com/jupyterlab/lumino/pull/40)


## 2020-05-12

- @lumino/signaling: 1.3.5 => 1.3.6

- Fix `disconnectAll` implementation [#71](https://github.com/jupyterlab/lumino/pull/71)


## 2020-05-07

 - @lumino/coreutils: 1.4.2 => 1.4.3
 - @lumino/datagrid: 0.7.0 => 0.7.1
 - @lumino/default-theme: 0.3.0 => 0.3.1
 - @lumino/widgets: 1.12.0 => 1.12.1

- Tell bundlers to not package a crypto module for the browser [#70](https://github.com/jupyterlab/lumino/pull/70)
- Fix boolean logic when false is specified [#69](https://github.com/jupyterlab/lumino/pull/69)
- Fix namespacing for 'invalid' classname [#67](https://github.com/jupyterlab/lumino/pull/67)


## 2020-04-24

 - @lumino/application: 1.8.4 => 1.9.0
 - @lumino/datagrid: 0.6.0 => 0.7.0
 - @lumino/default-theme: 0.2.4 => 0.3.0
 - @lumino/polling: 1.1.1 => 1.2.0
 - @lumino/widgets: 1.11.1 => 1.12.0

 - Customize minimum row and column section sizes for datagrid [#65](https://github.com/jupyterlab/lumino/pull/65)
 - Fixes tabsMovable on DockPanel [#66](https://github.com/jupyterlab/lumino/pull/66)


## 2020-03-22

 - @lumino/datagrid: 0.5.3 => 0.6.0
 - @lumino/datastore: 0.8.4 => 0.9.0
 - @lumino/polling: 1.0.4 => 1.1.1

 - Update throttler API [#54](https://github.com/jupyterlab/lumino/pull/54).


## 2020-02-10

 - @lumino/commands@1.10.0
 - @lumino/virtualdom@1.6.0
 - @lumino/widgets@1.11.0

 - Normalize `icon` fields across all interfaces [#46](https://github.com/jupyterlab/lumino/pull/46).


## 2020-01-27

- @lumino/virtualdom@1.5.0

- Simplified/improved custom rendering of virtual nodes: removed `hpass` and `VirtualElementPass`, added optional `renderer` param [#44](https://github.com/jupyterlab/lumino/pull/44)


## 2020-01-24
 - @lumino/datagrid@0.5.0

 - DataGrid Cell Editing [#14](https://github.com/jupyterlab/lumino/pull/14)


## 2020-01-07

 - @lumino/application@1.8.0
 - @lumino/datagrid@0.4.0
 - @lumino/default-theme@0.2.0
 - @lumino/dragdrop@1.5.0
 - @lumino/widgets@1.10.0

- Update selector, data attribute, and event namespaces [#20](https://github.com/jupyterlab/lumino/pull/20).  All of the legacy `p-*` CSS selectors are renamed to `lm-*` and the `p-*` classes will continue to work but be deprecated until the next major release.
