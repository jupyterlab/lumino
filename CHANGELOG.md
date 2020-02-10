# Change Log

All notable changes to this project will be documented in this file.

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
