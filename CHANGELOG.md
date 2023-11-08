---
github_url: 'https://github.com/jupyterlab/lumino/blob/main/CHANGELOG.md'
---

# Changelog

<!-- <START NEW CHANGELOG ENTRY> -->

## 2023.11.5

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/algorithm@2.0.1...30c6064dbf6450fb19925ff697dff20e9dd1516e))

```
@lumino/application: 2.2.1 => 2.3.0
@lumino/commands: 2.1.3 => 2.2.0
@lumino/datagrid: 2.2.0 => 2.3.0
@lumino/default-theme: 2.1.3 => 2.1.4
@lumino/dragdrop: 2.1.3 => 2.1.4
@lumino/widgets: 2.3.0 => 2.3.1
```

### New features added

- Datagrid: Introduce AsyncCellRenderer and ImageRenderer [#630](https://github.com/jupyterlab/lumino/pull/630) ([@martinRenou](https://github.com/martinRenou))

### Enhancements made

- Remove dynamic keyboard event mode [#653](https://github.com/jupyterlab/lumino/pull/653) ([@brichet](https://github.com/brichet))
- Pass `_luminoEvent` argument when executing commands via keybinding [#644](https://github.com/jupyterlab/lumino/pull/644) ([@andrewfulton9](https://github.com/andrewfulton9))
- Keydown event at bubbling phase [#635](https://github.com/jupyterlab/lumino/pull/635) ([@brichet](https://github.com/brichet))

### Bugs fixed

- Propagate scroll from backdrop [#652](https://github.com/jupyterlab/lumino/pull/652) ([@krassowski](https://github.com/krassowski))
- Add default top/left for `.lm-mod-drag-image` [#651](https://github.com/jupyterlab/lumino/pull/651) ([@krassowski](https://github.com/krassowski))
- Added role of button to addButton to make itkeyboard accessible when using screenreader [#615](https://github.com/jupyterlab/lumino/pull/615) ([@s596757](https://github.com/s596757))
- MenuBar: do not focus on hover [#607](https://github.com/jupyterlab/lumino/pull/607) ([@gabalafou](https://github.com/gabalafou))

### Maintenance and upkeep improvements

- Update versions for a new release [#656](https://github.com/jupyterlab/lumino/pull/656) ([@krassowski](https://github.com/krassowski))
- Bump tj-actions/changed-files from 39.2.3 to 40.0.0 [#654](https://github.com/jupyterlab/lumino/pull/654) ([@dependabot](https://github.com/dependabot))
- Bump actions/setup-node from 3 to 4 [#649](https://github.com/jupyterlab/lumino/pull/649) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 39.2.2 to 39.2.3 [#648](https://github.com/jupyterlab/lumino/pull/648) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 39.2.1 to 39.2.2 [#647](https://github.com/jupyterlab/lumino/pull/647) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 39.2.0 to 39.2.1 [#646](https://github.com/jupyterlab/lumino/pull/646) ([@dependabot](https://github.com/dependabot))
- Bump postcss from 8.4.24 to 8.4.31 [#645](https://github.com/jupyterlab/lumino/pull/645) ([@dependabot](https://github.com/dependabot))
- Switch from `hub` to `gh` CLI [#643](https://github.com/jupyterlab/lumino/pull/643) ([@fcollonval](https://github.com/fcollonval))
- Bump toshimaru/auto-author-assign from 2.0.0 to 2.0.1 [#642](https://github.com/jupyterlab/lumino/pull/642) ([@dependabot](https://github.com/dependabot))
- Bump get-func-name from 2.0.0 to 2.0.2 [#640](https://github.com/jupyterlab/lumino/pull/640) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 39.0.3 to 39.2.0 [#639](https://github.com/jupyterlab/lumino/pull/639) ([@dependabot](https://github.com/dependabot))
- Bump toshimaru/auto-author-assign from 1.6.2 to 2.0.0 [#638](https://github.com/jupyterlab/lumino/pull/638) ([@dependabot](https://github.com/dependabot))
- Update versions [#636](https://github.com/jupyterlab/lumino/pull/636) ([@fcollonval](https://github.com/fcollonval))
- Bump tj-actions/changed-files from 39.0.1 to 39.0.3 [#634](https://github.com/jupyterlab/lumino/pull/634) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 38.2.1 to 39.0.1 [#632](https://github.com/jupyterlab/lumino/pull/632) ([@dependabot](https://github.com/dependabot))
- Added a test to check the add tab button has a role of button [#631](https://github.com/jupyterlab/lumino/pull/631) ([@m158261](https://github.com/m158261))
- Bump actions/checkout from 3 to 4 [#629](https://github.com/jupyterlab/lumino/pull/629) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 37.6.1 to 38.2.1 [#628](https://github.com/jupyterlab/lumino/pull/628) ([@dependabot](https://github.com/dependabot))
- Bump apache/skywalking-eyes from 0.4.0 to 0.5.0 [#625](https://github.com/jupyterlab/lumino/pull/625) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 37.6.0 to 37.6.1 [#624](https://github.com/jupyterlab/lumino/pull/624) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 37.5.1 to 37.6.0 [#621](https://github.com/jupyterlab/lumino/pull/621) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 37.4.0 to 37.5.1 [#620](https://github.com/jupyterlab/lumino/pull/620) ([@dependabot](https://github.com/dependabot))

### Deprecated features

- Remove dynamic keyboard event mode [#653](https://github.com/jupyterlab/lumino/pull/653) ([@brichet](https://github.com/brichet))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2023-07-27&to=2023-11-05&type=c))

[@andrewfulton9](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aandrewfulton9+updated%3A2023-07-27..2023-11-05&type=Issues) | [@brichet](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Abrichet+updated%3A2023-07-27..2023-11-05&type=Issues) | [@dependabot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adependabot+updated%3A2023-07-27..2023-11-05&type=Issues) | [@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2023-07-27..2023-11-05&type=Issues) | [@gabalafou](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Agabalafou+updated%3A2023-07-27..2023-11-05&type=Issues) | [@krassowski](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Akrassowski+updated%3A2023-07-27..2023-11-05&type=Issues) | [@m158261](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Am158261+updated%3A2023-07-27..2023-11-05&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3AmartinRenou+updated%3A2023-07-27..2023-11-05&type=Issues) | [@s596757](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3As596757+updated%3A2023-07-27..2023-11-05&type=Issues) | [@tonyfast](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Atonyfast+updated%3A2023-07-27..2023-11-05&type=Issues) | [@welcome](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Awelcome+updated%3A2023-07-27..2023-11-05&type=Issues)

<!-- <END NEW CHANGELOG ENTRY> -->

## 2023.9.25-alpha.0

([Full Changelog](https://github.com/jupyterlab/lumino/compare/v2023.7.27...dbbaf769024b39a9558f1ef66bf99c08d4d0d70c))

```
@lumino/application: 2.2.1 => 2.3.0-alpha.0
@lumino/datagrid: 2.2.0 => 2.3.0-alpha.0
@lumino/default-theme: 2.1.3 => 2.1.4-alpha.0
@lumino/widgets: 2.3.0 => 2.3.1-alpha.0
```

### New features added

- Datagrid: Introduce AsyncCellRenderer and ImageRenderer [#630](https://github.com/jupyterlab/lumino/pull/630) ([@martinRenou](https://github.com/martinRenou))

### Enhancements made

- Keydown event at bubbling phase [#635](https://github.com/jupyterlab/lumino/pull/635) ([@brichet](https://github.com/brichet))
- Datagrid: Introduce AsyncCellRenderer and ImageRenderer [#630](https://github.com/jupyterlab/lumino/pull/630) ([@martinRenou](https://github.com/martinRenou))

### Bugs fixed

- Added role of button to addButton to make itkeyboard accessible when using screenreader [#615](https://github.com/jupyterlab/lumino/pull/615) ([@s596757](https://github.com/s596757))
- MenuBar: do not focus on hover [#607](https://github.com/jupyterlab/lumino/pull/607) ([@gabalafou](https://github.com/gabalafou))

### Maintenance and upkeep improvements

- Update versions [#636](https://github.com/jupyterlab/lumino/pull/636) ([@fcollonval](https://github.com/fcollonval))
- Bump tj-actions/changed-files from 39.0.1 to 39.0.3 [#634](https://github.com/jupyterlab/lumino/pull/634) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 38.2.1 to 39.0.1 [#632](https://github.com/jupyterlab/lumino/pull/632) ([@dependabot](https://github.com/dependabot))
- Added a test to check the add tab button has a role of button [#631](https://github.com/jupyterlab/lumino/pull/631) ([@m158261](https://github.com/m158261))
- Bump actions/checkout from 3 to 4 [#629](https://github.com/jupyterlab/lumino/pull/629) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 37.6.1 to 38.2.1 [#628](https://github.com/jupyterlab/lumino/pull/628) ([@dependabot](https://github.com/dependabot))
- Bump apache/skywalking-eyes from 0.4.0 to 0.5.0 [#625](https://github.com/jupyterlab/lumino/pull/625) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 37.6.0 to 37.6.1 [#624](https://github.com/jupyterlab/lumino/pull/624) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 37.5.1 to 37.6.0 [#621](https://github.com/jupyterlab/lumino/pull/621) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 37.4.0 to 37.5.1 [#620](https://github.com/jupyterlab/lumino/pull/620) ([@dependabot](https://github.com/dependabot))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2023-07-27&to=2023-09-25&type=c))

[@brichet](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Abrichet+updated%3A2023-07-27..2023-09-25&type=Issues) | [@dependabot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adependabot+updated%3A2023-07-27..2023-09-25&type=Issues) | [@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2023-07-27..2023-09-25&type=Issues) | [@gabalafou](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Agabalafou+updated%3A2023-07-27..2023-09-25&type=Issues) | [@krassowski](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Akrassowski+updated%3A2023-07-27..2023-09-25&type=Issues) | [@m158261](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Am158261+updated%3A2023-07-27..2023-09-25&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3AmartinRenou+updated%3A2023-07-27..2023-09-25&type=Issues) | [@s596757](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3As596757+updated%3A2023-07-27..2023-09-25&type=Issues) | [@welcome](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Awelcome+updated%3A2023-07-27..2023-09-25&type=Issues)

## 2023.7.27

([Full Changelog](https://github.com/jupyterlab/lumino/compare/v2023.6.22...c90d19e7a4706c37c31961052206aa2a0d5144b9))

```
@lumino/algorithm: 2.0.0 => 2.0.1
@lumino/application: 2.2.0 => 2.2.1
@lumino/collections: 2.0.0 => 2.0.1
@lumino/commands: 2.1.2 => 2.1.3
@lumino/coreutils: 2.1.1 => 2.1.2
@lumino/datagrid: 2.1.2 => 2.2.0
@lumino/default-theme: 2.1.2 => 2.1.3
@lumino/disposable: 2.1.1 => 2.1.2
@lumino/domutils: 2.0.0 => 2.0.1
@lumino/dragdrop: 2.1.2 => 2.1.3
@lumino/keyboard: 2.0.0 => 2.0.1
@lumino/messaging: 2.0.0 => 2.0.1
@lumino/polling: 2.1.1 => 2.1.2
@lumino/properties: 2.0.0 => 2.0.1
@lumino/signaling: 2.1.1 => 2.1.2
@lumino/virtualdom: 2.0.0 => 2.0.1
@lumino/widgets: 2.2.0 => 2.3.0
```

### New features added

- Do not set the dockpanel as parent of the tabbar [#606](https://github.com/jupyterlab/lumino/pull/606) ([@brichet](https://github.com/brichet))

### Enhancements made

- Add expansion toggled signal of subpanels in an Accordion Panel [#614](https://github.com/jupyterlab/lumino/pull/614) ([@DenisaCG](https://github.com/DenisaCG))
- \[accessibility\] Uses the arrow keys for tab bar navigation [#612](https://github.com/jupyterlab/lumino/pull/612) ([@brichet](https://github.com/brichet))
- elements respond to enter or spacebar [#590](https://github.com/jupyterlab/lumino/pull/590) ([@g547315](https://github.com/g547315))
- Resize column to fit text on double click [#546](https://github.com/jupyterlab/lumino/pull/546) ([@vthemelis](https://github.com/vthemelis))

### Bugs fixed

- Do not set the dockpanel as parent of the tabbar [#606](https://github.com/jupyterlab/lumino/pull/606) ([@brichet](https://github.com/brichet))

### Maintenance and upkeep improvements

- Update versions [#619](https://github.com/jupyterlab/lumino/pull/619) ([@fcollonval](https://github.com/fcollonval))
- Bump tj-actions/changed-files from 37.1.2 to 37.4.0 [#613](https://github.com/jupyterlab/lumino/pull/613) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 37.1.0 to 37.1.2 [#611](https://github.com/jupyterlab/lumino/pull/611) ([@dependabot](https://github.com/dependabot))
- Bump semver from 5.7.1 to 5.7.2 [#609](https://github.com/jupyterlab/lumino/pull/609) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 37.0.5 to 37.1.0 [#608](https://github.com/jupyterlab/lumino/pull/608) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 37.0.3 to 37.0.5 [#605](https://github.com/jupyterlab/lumino/pull/605) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 36.4.0 to 37.0.3 [#603](https://github.com/jupyterlab/lumino/pull/603) ([@dependabot](https://github.com/dependabot))
- Upgrade dev dependencies [#599](https://github.com/jupyterlab/lumino/pull/599) ([@fcollonval](https://github.com/fcollonval))

### Documentation improvements

- Update releaser workflow names [#602](https://github.com/jupyterlab/lumino/pull/602) ([@fcollonval](https://github.com/fcollonval))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2023-06-23&to=2023-07-27&type=c))

[@brichet](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Abrichet+updated%3A2023-06-23..2023-07-27&type=Issues) | [@DenisaCG](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3ADenisaCG+updated%3A2023-06-23..2023-07-27&type=Issues) | [@dependabot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adependabot+updated%3A2023-06-23..2023-07-27&type=Issues) | [@echarles](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aecharles+updated%3A2023-06-23..2023-07-27&type=Issues) | [@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2023-06-23..2023-07-27&type=Issues) | [@g547315](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ag547315+updated%3A2023-06-23..2023-07-27&type=Issues) | [@krassowski](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Akrassowski+updated%3A2023-06-23..2023-07-27&type=Issues) | [@tonyfast](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Atonyfast+updated%3A2023-06-23..2023-07-27&type=Issues) | [@vthemelis](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Avthemelis+updated%3A2023-06-23..2023-07-27&type=Issues) | [@welcome](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Awelcome+updated%3A2023-06-23..2023-07-27&type=Issues)

## 2023.6.22

([Full Changelog](https://github.com/jupyterlab/lumino/compare/v2023.4.27...521819af3fd92f8fbcaf5088b9ea89dc7e21d8a2))

```
@lumino/application: 2.1.1 => 2.2.0
@lumino/commands: 2.1.1 => 2.1.2
@lumino/datagrid: 2.1.1 => 2.1.2
@lumino/default-theme: 2.1.1 => 2.1.2
@lumino/dragdrop: 2.1.1 => 2.1.2
@lumino/widgets: 2.1.1 => 2.2.0
```

### Enhancements made

- Use Actual Return character for Mac shortcuts. [#592](https://github.com/jupyterlab/lumino/pull/592) ([@Carreau](https://github.com/Carreau))
- Add a 'defer' option to the autoStart argument [#588](https://github.com/jupyterlab/lumino/pull/588) ([@brichet](https://github.com/brichet))
- Added "tabindex=0" for sidebar accessibility [#583](https://github.com/jupyterlab/lumino/pull/583) ([@j264415](https://github.com/j264415))
- Splits with merge option for dock panels [#582](https://github.com/jupyterlab/lumino/pull/582) ([@tavin](https://github.com/tavin))

### Bugs fixed

- Fix position of drag image [#595](https://github.com/jupyterlab/lumino/pull/595) ([@MetRonnie](https://github.com/MetRonnie))
- Invalid unicode characters removed from datagrid [#578](https://github.com/jupyterlab/lumino/pull/578) ([@nicojapas](https://github.com/nicojapas))
- Fix dblclick events with Drag.overrideCursor active (#547) [#564](https://github.com/jupyterlab/lumino/pull/564) ([@jjrv](https://github.com/jjrv))

### Maintenance and upkeep improvements

- Bump versions [#600](https://github.com/jupyterlab/lumino/pull/600) ([@fcollonval](https://github.com/fcollonval))
- Upgrade releaser workflows [#598](https://github.com/jupyterlab/lumino/pull/598) ([@fcollonval](https://github.com/fcollonval))
- Bump tj-actions/changed-files from 36.1.0 to 36.4.0 [#597](https://github.com/jupyterlab/lumino/pull/597) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 36.0.17 to 36.1.0 [#594](https://github.com/jupyterlab/lumino/pull/594) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 36.0.9 to 36.0.17 [#591](https://github.com/jupyterlab/lumino/pull/591) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 35.9.2 to 36.0.9 [#589](https://github.com/jupyterlab/lumino/pull/589) ([@dependabot](https://github.com/dependabot))
- Bump socket.io-parser from 4.2.1 to 4.2.3 [#587](https://github.com/jupyterlab/lumino/pull/587) ([@dependabot](https://github.com/dependabot))
- Seed tests for datagrid, test `TextRenderer/drawText` [#585](https://github.com/jupyterlab/lumino/pull/585) ([@krassowski](https://github.com/krassowski))
- Bump tj-actions/changed-files from 35.9.0 to 35.9.2 [#580](https://github.com/jupyterlab/lumino/pull/580) ([@dependabot](https://github.com/dependabot))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2023-04-27&to=2023-06-22&type=c))

[@brichet](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Abrichet+updated%3A2023-04-27..2023-06-22&type=Issues) | [@Carreau](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3ACarreau+updated%3A2023-04-27..2023-06-22&type=Issues) | [@dependabot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adependabot+updated%3A2023-04-27..2023-06-22&type=Issues) | [@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2023-04-27..2023-06-22&type=Issues) | [@j264415](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aj264415+updated%3A2023-04-27..2023-06-22&type=Issues) | [@jjrv](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ajjrv+updated%3A2023-04-27..2023-06-22&type=Issues) | [@krassowski](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Akrassowski+updated%3A2023-04-27..2023-06-22&type=Issues) | [@MetRonnie](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3AMetRonnie+updated%3A2023-04-27..2023-06-22&type=Issues) | [@nicojapas](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Anicojapas+updated%3A2023-04-27..2023-06-22&type=Issues) | [@tavin](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Atavin+updated%3A2023-04-27..2023-06-22&type=Issues) | [@welcome](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Awelcome+updated%3A2023-04-27..2023-06-22&type=Issues)

## 2023.4.27

([Full Changelog](https://github.com/jupyterlab/lumino/compare/v2023.4.7...2781964ce32d672fe37b815ec8cd690f99fd20aa))

```
@lumino/application: 2.1.0 => 2.1.1
@lumino/commands: 2.1.0 => 2.1.1
@lumino/coreutils: 2.1.0 => 2.1.1
@lumino/datagrid: 2.1.0 => 2.1.1
@lumino/default-theme: 2.1.0 => 2.1.1
@lumino/disposable: 2.1.0 => 2.1.1
@lumino/dragdrop: 2.1.0 => 2.1.1
@lumino/polling: 2.1.0 => 2.1.1
@lumino/signaling: 2.1.0 => 2.1.1
@lumino/widgets: 2.1.0 => 2.1.1
```

### Maintenance and upkeep improvements

- Bump patch version [#579](https://github.com/jupyterlab/lumino/pull/579) ([@fcollonval](https://github.com/fcollonval))
- Make `Token.description` optional for backward compatibility [#577](https://github.com/jupyterlab/lumino/pull/577) ([@fcollonval](https://github.com/fcollonval))
- Bump tj-actions/changed-files from 35.8.0 to 35.9.0 [#576](https://github.com/jupyterlab/lumino/pull/576) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 35.7.12 to 35.8.0 [#575](https://github.com/jupyterlab/lumino/pull/575) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 35.7.8 to 35.7.12 [#574](https://github.com/jupyterlab/lumino/pull/574) ([@dependabot](https://github.com/dependabot))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2023-04-07&to=2023-04-27&type=c))

[@dependabot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adependabot+updated%3A2023-04-07..2023-04-27&type=Issues) | [@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2023-04-07..2023-04-27&type=Issues)

## 2023.4.7

([Full Changelog](https://github.com/jupyterlab/lumino/compare/v2023.3.27-1...df643f9474f036eafbbb1249384a7cd247c2a2e1))

```
@lumino/application: 2.0.1 => 2.1.0
@lumino/commands: 2.0.1 => 2.1.0
@lumino/coreutils: 2.0.0 => 2.1.0
@lumino/datagrid: 2.0.1 => 2.1.0
@lumino/default-theme: 2.0.1 => 2.1.0
@lumino/disposable: 2.0.0 => 2.1.0
@lumino/dragdrop: 1.14.5 => 2.1.0
@lumino/polling: 2.0.0 => 2.1.0
@lumino/signaling: 2.0.0 => 2.1.0
@lumino/widgets: 2.0.1 => 2.1.0
```

### Enhancements made

- Add optional `description` to `Token` [#572](https://github.com/jupyterlab/lumino/pull/572) ([@fcollonval](https://github.com/fcollonval))

### Maintenance and upkeep improvements

- Bump coreutils minor version [#573](https://github.com/jupyterlab/lumino/pull/573) ([@fcollonval](https://github.com/fcollonval))
- Bump tj-actions/changed-files from 35.7.6 to 35.7.8 [#571](https://github.com/jupyterlab/lumino/pull/571) ([@dependabot](https://github.com/dependabot))
- Bump tj-actions/changed-files from 35.7.2 to 35.7.6 [#569](https://github.com/jupyterlab/lumino/pull/569) ([@dependabot](https://github.com/dependabot))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2023-03-28&to=2023-04-07&type=c))

[@dependabot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adependabot+updated%3A2023-03-28..2023-04-07&type=Issues) | [@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2023-03-28..2023-04-07&type=Issues)

## 2023.3.27

([Full Changelog](https://github.com/jupyterlab/lumino/compare/v2023.3.15...0a73581874b5cee395282ee16875963cf4440bc7))

```
@lumino/application: 2.0.0 => 2.0.1
@lumino/commands: 2.0.0 => 2.0.1
@lumino/datagrid: 2.0.0 => 2.0.1
@lumino/default-theme: 2.0.0 => 2.0.1
@lumino/widgets: 2.0.0 => 2.0.1
```

### Bugs fixed

- Prevents enter from being interpreted as emoji [#563](https://github.com/jupyterlab/lumino/pull/563) ([@JasonWeill](https://github.com/JasonWeill))
- Disable size containment for split handle [#560](https://github.com/jupyterlab/lumino/pull/560) ([@krassowski](https://github.com/krassowski))

### Maintenance and upkeep improvements

- Update versions [#566](https://github.com/jupyterlab/lumino/pull/566) ([@fcollonval](https://github.com/fcollonval))
- Bump tj-actions/changed-files from 35.6.4 to 35.7.2 [#562](https://github.com/jupyterlab/lumino/pull/562) ([@dependabot](https://github.com/dependabot))

### Documentation improvements

- Backport changelog from 1.x [#558](https://github.com/jupyterlab/lumino/pull/558) ([@fcollonval](https://github.com/fcollonval))
- Improve documentation [#557](https://github.com/jupyterlab/lumino/pull/557) ([@fcollonval](https://github.com/fcollonval))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2023-03-15&to=2023-03-27&type=c))

[@andrii-i](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aandrii-i+updated%3A2023-03-15..2023-03-27&type=Issues) | [@dependabot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adependabot+updated%3A2023-03-15..2023-03-27&type=Issues) | [@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2023-03-15..2023-03-27&type=Issues) | [@JasonWeill](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3AJasonWeill+updated%3A2023-03-15..2023-03-27&type=Issues) | [@krassowski](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Akrassowski+updated%3A2023-03-15..2023-03-27&type=Issues) | [@welcome](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Awelcome+updated%3A2023-03-15..2023-03-27&type=Issues)

## 2023.3.15

([Full Changelog](https://github.com/jupyterlab/lumino/compare/v2022.8.8...5a1a05a1642f8262d607e3e30f61ab39f912d2c8))

```
@lumino/algorithm: 1.9.2 => 2.0.0
@lumino/application: 1.31.3 => 2.0.0
@lumino/collections: 1.9.3 => 2.0.0
@lumino/commands: 1.21.1 => 2.0.0
@lumino/coreutils: 1.12.1 => 2.0.0
@lumino/datagrid: 0.36.8 => 2.0.0
@lumino/default-theme: 0.22.8 => 2.0.0
@lumino/disposable: 1.10.4 => 2.0.0
@lumino/domutils: 1.8.2 => 2.0.0
@lumino/dragdrop: 1.14.4 => 2.0.0
@lumino/keyboard: 1.8.2 => 2.0.0
@lumino/messaging: 1.10.3 => 2.0.0
@lumino/polling: 1.11.4 => 2.0.0
@lumino/properties: 1.8.2 => 2.0.0
@lumino/signaling: 1.11.1 => 2.0.0
@lumino/virtualdom: 1.14.3 => 2.0.0
@lumino/widgets: 1.37.1 => 2.0.0
```

### Highlights :sparkles:

- Drop custom iterator in favor of standard [Iterators and generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)
- Add asynchronous iterable `Stream` class inheriting from `Signal`
- Various performance enhancements on the [datagrid](https://github.com/jupyterlab/lumino/pull/394)
- Assets target is now _ES2018_

See [migration guide](https://lumino.readthedocs.io/en/latest/migration.html) for more details on API changes when migrating from version 1 to version 2.

### Enhancements made

- Make `IOverflowMenuOptions.title` optional [#550](https://github.com/jupyterlab/lumino/pull/550) ([@jtpio](https://github.com/jtpio))
- Check for hidden items before re-rendering [#531](https://github.com/jupyterlab/lumino/pull/531) ([@alec-kr](https://github.com/alec-kr))
- Add contain strict for elements with fully managed layout [#506](https://github.com/jupyterlab/lumino/pull/506) ([@krassowski](https://github.com/krassowski))
- Add content-visibility hide mode [#497](https://github.com/jupyterlab/lumino/pull/497) ([@krassowski](https://github.com/krassowski))
- Collapse main menu options in a hamburger menu [#489](https://github.com/jupyterlab/lumino/pull/489) ([@steff456](https://github.com/steff456))
- Improve the menubar accessibility [#465](https://github.com/jupyterlab/lumino/pull/465) ([@scmmmh](https://github.com/scmmmh))
- Add async iterable `Stream` class that inherits from `Signal` [#462](https://github.com/jupyterlab/lumino/pull/462) ([@afshin](https://github.com/afshin))
- Disable text eliding by default [#451](https://github.com/jupyterlab/lumino/pull/451) ([@ibdafna](https://github.com/ibdafna))
- Add support for list of keystrokes [#433](https://github.com/jupyterlab/lumino/pull/433) ([@fcollonval](https://github.com/fcollonval))
- Add plugin description [#419](https://github.com/jupyterlab/lumino/pull/419) ([@fcollonval](https://github.com/fcollonval))
- Improve title on accordion label [#406](https://github.com/jupyterlab/lumino/pull/406) ([@fcollonval](https://github.com/fcollonval))
- Handle deferred processing when `document` is hidden [#402](https://github.com/jupyterlab/lumino/pull/402) ([@afshin](https://github.com/afshin))
- Improve datagrid performance [#394](https://github.com/jupyterlab/lumino/pull/394) ([@martinRenou](https://github.com/martinRenou))
- Make `Poll` an async iterable [#386](https://github.com/jupyterlab/lumino/pull/386) ([@afshin](https://github.com/afshin))
- Dynamic extensions reloading [#377](https://github.com/jupyterlab/lumino/pull/377) ([@fcollonval](https://github.com/fcollonval))
- Fix tab trap in menubar [#373](https://github.com/jupyterlab/lumino/pull/373) ([@gabalafou](https://github.com/gabalafou))

### Bugs fixed

- Fix requiring position for `MenuBar` undetermined index [#549](https://github.com/jupyterlab/lumino/pull/549) ([@fcollonval](https://github.com/fcollonval))
- Accessibility in accordion panel [#537](https://github.com/jupyterlab/lumino/pull/537) ([@brichet](https://github.com/brichet))
- Remove cursor style [#534](https://github.com/jupyterlab/lumino/pull/534) ([@fcollonval](https://github.com/fcollonval))
- Accessibility: role attributes [#507](https://github.com/jupyterlab/lumino/pull/507) ([@brichet](https://github.com/brichet))
- Improve performance of drag & drop, esp. in Chrome [#502](https://github.com/jupyterlab/lumino/pull/502) ([@krassowski](https://github.com/krassowski))
- Only add aria-hidden for `scale` mode [#501](https://github.com/jupyterlab/lumino/pull/501) ([@krassowski](https://github.com/krassowski))
- Fix finding dependents for deactivation [#490](https://github.com/jupyterlab/lumino/pull/490) ([@fcollonval](https://github.com/fcollonval))
- Fix drag-and-drop of nested dock panel [#473](https://github.com/jupyterlab/lumino/pull/473) ([@drcd1](https://github.com/drcd1))
- When rejecting the internal promise in a `Stream`, catch failures [#464](https://github.com/jupyterlab/lumino/pull/464) ([@afshin](https://github.com/afshin))
- Datagrid: Do not prevent page scroll if we are not actually scrolling the grid [#446](https://github.com/jupyterlab/lumino/pull/446) ([@martinRenou](https://github.com/martinRenou))
- Avoid menu layout trashing by moving DOM queries [#432](https://github.com/jupyterlab/lumino/pull/432) ([@krassowski](https://github.com/krassowski))
- Fix resizing and mode switching in `DockPanel` [#411](https://github.com/jupyterlab/lumino/pull/411) ([@afshin](https://github.com/afshin))
- Fix labelledby to support multiple elements on page [#407](https://github.com/jupyterlab/lumino/pull/407) ([@fcollonval](https://github.com/fcollonval))
- Handle deferred processing when `document` is hidden [#402](https://github.com/jupyterlab/lumino/pull/402) ([@afshin](https://github.com/afshin))
- Switch to using `setTimeout` for all deferred processing. [#395](https://github.com/jupyterlab/lumino/pull/395) ([@thetorpedodog](https://github.com/thetorpedodog))
- Fix bug that prevents any startup plugins from activating [#391](https://github.com/jupyterlab/lumino/pull/391) ([@afshin](https://github.com/afshin))
- Fix service type [#382](https://github.com/jupyterlab/lumino/pull/382) ([@afshin](https://github.com/afshin))
- Refactor `retro()`, clean up iterators [#361](https://github.com/jupyterlab/lumino/pull/361) ([@afshin](https://github.com/afshin))

### Maintenance and upkeep improvements

- Target ES2018 [#388](https://github.com/jupyterlab/lumino/pull/388) ([@afshin](https://github.com/afshin))
- Audit `DataGrid` public API in preparation for 0.x => 2.0 [#458](https://github.com/jupyterlab/lumino/pull/458) ([@afshin](https://github.com/afshin))
- Set publication to public [#545](https://github.com/jupyterlab/lumino/pull/545) ([@fcollonval](https://github.com/fcollonval))
- Update to yarn 3 [#536](https://github.com/jupyterlab/lumino/pull/536) ([@fcollonval](https://github.com/fcollonval))
- Bump tj-actions/changed-files from 24 to 35.6.4 [#555](https://github.com/jupyterlab/lumino/pull/555) [#552](https://github.com/jupyterlab/lumino/pull/552) [#548](https://github.com/jupyterlab/lumino/pull/548) [#543](https://github.com/jupyterlab/lumino/pull/543) [#538](https://github.com/jupyterlab/lumino/pull/538) [#532](https://github.com/jupyterlab/lumino/pull/532) [#525](https://github.com/jupyterlab/lumino/pull/525) [#518](https://github.com/jupyterlab/lumino/pull/518) [#514](https://github.com/jupyterlab/lumino/pull/514) [#508](https://github.com/jupyterlab/lumino/pull/508) [#503](https://github.com/jupyterlab/lumino/pull/503) [#493](https://github.com/jupyterlab/lumino/pull/493) [#466](https://github.com/jupyterlab/lumino/pull/466) [#461](https://github.com/jupyterlab/lumino/pull/461) [#454](https://github.com/jupyterlab/lumino/pull/454) [#445](https://github.com/jupyterlab/lumino/pull/445) [#435](https://github.com/jupyterlab/lumino/pull/435) [#424](https://github.com/jupyterlab/lumino/pull/424) [#423](https://github.com/jupyterlab/lumino/pull/423) [#417](https://github.com/jupyterlab/lumino/pull/417) [#404](https://github.com/jupyterlab/lumino/pull/404) [#389](https://github.com/jupyterlab/lumino/pull/389) [#379](https://github.com/jupyterlab/lumino/pull/379) [#372](https://github.com/jupyterlab/lumino/pull/372) [#352](https://github.com/jupyterlab/lumino/pull/352) ([@dependabot](https://github.com/dependabot))
- Bump verdaccio [#544](https://github.com/jupyterlab/lumino/pull/544) ([@fcollonval](https://github.com/fcollonval))
- Bump http-cache-semantics from 4.1.0 to 4.1.1 [#530](https://github.com/jupyterlab/lumino/pull/530) ([@dependabot](https://github.com/dependabot))
- Bump ua-parser-js from 0.7.32 to 0.7.33 [#529](https://github.com/jupyterlab/lumino/pull/529) ([@dependabot](https://github.com/dependabot))
- Bump toshimaru/auto-author-assign from 1.6.1 to 1.6.2 [#513](https://github.com/jupyterlab/lumino/pull/513) ([@dependabot](https://github.com/dependabot))
- Upgrade dev tools [#512](https://github.com/jupyterlab/lumino/pull/512) ([@fcollonval](https://github.com/fcollonval))
- Bump json5 from 1.0.1 to 1.0.2 [#510](https://github.com/jupyterlab/lumino/pull/510) ([@dependabot](https://github.com/dependabot))
- Bump dessant/lock-threads from 3 to 4 [#492](https://github.com/jupyterlab/lumino/pull/492) ([@dependabot](https://github.com/dependabot))
- Bump decode-uri-component from 0.2.0 to 0.2.2 [#483](https://github.com/jupyterlab/lumino/pull/483) ([@dependabot](https://github.com/dependabot))
- Use Firefox from playwright [#481](https://github.com/jupyterlab/lumino/pull/481) ([@fcollonval](https://github.com/fcollonval))
- Set up jupyter releaser [#474](https://github.com/jupyterlab/lumino/pull/474) ([@blink1073](https://github.com/blink1073))
- Bump engine.io from 6.2.0 to 6.2.1 [#469](https://github.com/jupyterlab/lumino/pull/469) ([@dependabot](https://github.com/dependabot))
- Fix license header CI [#468](https://github.com/jupyterlab/lumino/pull/468) ([@fcollonval](https://github.com/fcollonval))
- Bump loader-utils from 3.2.0 to 3.2.1 [#467](https://github.com/jupyterlab/lumino/pull/467) ([@dependabot](https://github.com/dependabot))
- Bump actions/checkout from 2 to 3 [#460](https://github.com/jupyterlab/lumino/pull/460) ([@dependabot](https://github.com/dependabot))
- Fix check release step [#459](https://github.com/jupyterlab/lumino/pull/459) ([@fcollonval](https://github.com/fcollonval))
- Clean up test workflow [#437](https://github.com/jupyterlab/lumino/pull/437) ([@blink1073](https://github.com/blink1073))
- Fix minor code scan warnings [#431](https://github.com/jupyterlab/lumino/pull/431) ([@fcollonval](https://github.com/fcollonval))
- Bump lerna [#429](https://github.com/jupyterlab/lumino/pull/429) ([@fcollonval](https://github.com/fcollonval))
- Add DockLayout tests [#421](https://github.com/jupyterlab/lumino/pull/421) ([@3coins](https://github.com/3coins))
- Remove Internet Explorer from tests, add Webkit [#416](https://github.com/jupyterlab/lumino/pull/416) ([@gabalafou](https://github.com/gabalafou))
- Follow on to #411 addressing `yield*` [#415](https://github.com/jupyterlab/lumino/pull/415) ([@afshin](https://github.com/afshin))
- Bump actions/setup-node from 1 to 3 [#405](https://github.com/jupyterlab/lumino/pull/405) ([@dependabot](https://github.com/dependabot))
- Bump actions/cache from 2 to 3 [#403](https://github.com/jupyterlab/lumino/pull/403) ([@dependabot](https://github.com/dependabot))
- Remove some webpack artifacts from `devDependencies` [#396](https://github.com/jupyterlab/lumino/pull/396) ([@afshin](https://github.com/afshin))
- Use `pull_request_target` to have write access on fork [#390](https://github.com/jupyterlab/lumino/pull/390) ([@fcollonval](https://github.com/fcollonval))
- Iterate on iterators [#378](https://github.com/jupyterlab/lumino/pull/378) ([@afshin](https://github.com/afshin))
- Deprecate `each<T>(...)` [#376](https://github.com/jupyterlab/lumino/pull/376) ([@afshin](https://github.com/afshin))
- Fix license header [#365](https://github.com/jupyterlab/lumino/pull/365) ([@fcollonval](https://github.com/fcollonval))
- Refactor `retro()`, clean up iterators [#361](https://github.com/jupyterlab/lumino/pull/361) ([@afshin](https://github.com/afshin))
- Update `dragdrop` to use `PointerEvent` and `DragEvent` [#355](https://github.com/jupyterlab/lumino/pull/355) ([@afshin](https://github.com/afshin))
- Bump actions/setup-python from 2 to 4 [#351](https://github.com/jupyterlab/lumino/pull/351) ([@dependabot](https://github.com/dependabot))
- Add more safety workflows [#350](https://github.com/jupyterlab/lumino/pull/350) ([@fcollonval](https://github.com/fcollonval))
- Use Rollup for tests and examples [#348](https://github.com/jupyterlab/lumino/pull/348) ([@gabalafou](https://github.com/gabalafou))
- Use native iterators instead of Lumino iterators [#346](https://github.com/jupyterlab/lumino/pull/346) ([@afshin](https://github.com/afshin))
- Remove `BPlusTree` class from `@lumino/collections` [#345](https://github.com/jupyterlab/lumino/pull/345) ([@afshin](https://github.com/afshin))
- Update NPM package author to Project Jupyter [#342](https://github.com/jupyterlab/lumino/pull/342) ([@afshin](https://github.com/afshin))

### Documentation improvements

- Update documentation for Stream class [#484](https://github.com/jupyterlab/lumino/pull/484) ([@afshin](https://github.com/afshin))
- Backport changelog for stable 1.x [#455](https://github.com/jupyterlab/lumino/pull/455) ([@fcollonval](https://github.com/fcollonval))
- Switch to pydata sphinx theme [#422](https://github.com/jupyterlab/lumino/pull/422) ([@blink1073](https://github.com/blink1073))
- Add section to README: Learning Resources [#420](https://github.com/jupyterlab/lumino/pull/420) ([@gabalafou](https://github.com/gabalafou))
- Follow on to #411 addressing `yield*` [#415](https://github.com/jupyterlab/lumino/pull/415) ([@afshin](https://github.com/afshin))
- Iterate on iterators [#378](https://github.com/jupyterlab/lumino/pull/378) ([@afshin](https://github.com/afshin))
- Deprecate `each<T>(...)` [#376](https://github.com/jupyterlab/lumino/pull/376) ([@afshin](https://github.com/afshin))
- Fix documentation CI error [#368](https://github.com/jupyterlab/lumino/pull/368) ([@fcollonval](https://github.com/fcollonval))
- Update license copyright date [#363](https://github.com/jupyterlab/lumino/pull/363) ([@fcollonval](https://github.com/fcollonval))
- Update and fix docs [#354](https://github.com/jupyterlab/lumino/pull/354) ([@gabalafou](https://github.com/gabalafou))
- Update NPM package author to Project Jupyter [#342](https://github.com/jupyterlab/lumino/pull/342) ([@afshin](https://github.com/afshin))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2022-08-08&to=2023-03-15&type=c))

[@3coins](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3A3coins+updated%3A2022-08-08..2023-03-15&type=Issues) | [@afshin](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aafshin+updated%3A2022-08-08..2023-03-15&type=Issues) | [@alec-kr](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aalec-kr+updated%3A2022-08-08..2023-03-15&type=Issues) | [@blink1073](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ablink1073+updated%3A2022-08-08..2023-03-15&type=Issues) | [@brichet](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Abrichet+updated%3A2022-08-08..2023-03-15&type=Issues) | [@dependabot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adependabot+updated%3A2022-08-08..2023-03-15&type=Issues) | [@drcd1](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adrcd1+updated%3A2022-08-08..2023-03-15&type=Issues) | [@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2022-08-08..2023-03-15&type=Issues) | [@gabalafou](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Agabalafou+updated%3A2022-08-08..2023-03-15&type=Issues) | [@ibdafna](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aibdafna+updated%3A2022-08-08..2023-03-15&type=Issues) | [@jasongrout](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ajasongrout+updated%3A2022-08-08..2023-03-15&type=Issues) | [@jtpio](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ajtpio+updated%3A2022-08-08..2023-03-15&type=Issues) | [@krassowski](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Akrassowski+updated%3A2022-08-08..2023-03-15&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3AmartinRenou+updated%3A2022-08-08..2023-03-15&type=Issues) | [@meeseeksdev](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ameeseeksdev+updated%3A2022-08-08..2023-03-15&type=Issues) | [@scmmmh](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ascmmmh+updated%3A2022-08-08..2023-03-15&type=Issues) | [@steff456](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Asteff456+updated%3A2022-08-08..2023-03-15&type=Issues) | [@thetorpedodog](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Athetorpedodog+updated%3A2022-08-08..2023-03-15&type=Issues) | [@vidartf](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Avidartf+updated%3A2022-08-08..2023-03-15&type=Issues) | [@welcome](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Awelcome+updated%3A2022-08-08..2023-03-15&type=Issues)

## 2023.3.27 (1.x)

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/application@1.31.3...45339b9ad932f305d58cbe3c60a57afcd88aa006))

### Bugs fixed

- Remove `IDragEvent` deprecated tag [#561](https://github.com/jupyterlab/lumino/pull/561) ([@afshin](https://github.com/afshin))

### Maintenance and upkeep improvements

- Update versions [#565](https://github.com/jupyterlab/lumino/pull/565) ([@fcollonval](https://github.com/fcollonval))

### Documentation improvements

- Remove `IDragEvent` deprecated tag [#561](https://github.com/jupyterlab/lumino/pull/561) ([@afshin](https://github.com/afshin))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2023-01-23&to=2023-03-27&type=c))

[@afshin](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aafshin+updated%3A2023-01-23..2023-03-27&type=Issues) | [@andrii-i](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aandrii-i+updated%3A2023-01-23..2023-03-27&type=Issues) | [@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2023-01-23..2023-03-27&type=Issues) | [@krassowski](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Akrassowski+updated%3A2023-01-23..2023-03-27&type=Issues) | [@steff456](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Asteff456+updated%3A2023-01-23..2023-03-27&type=Issues) | [@welcome](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Awelcome+updated%3A2023-01-23..2023-03-27&type=Issues)

## 2023.1.23

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/application@1.31.2...58081c0313e536ac9dbb86ee0a602a1fa8445130))

### Bugs fixed

- Add deprecation warning on Signal blocking feature [#521](https://github.com/jupyterlab/lumino/pull/521) ([@fcollonval](https://github.com/fcollonval))

### Maintenance and upkeep improvements

- Bump versions [#523](https://github.com/jupyterlab/lumino/pull/523) ([@fcollonval](https://github.com/fcollonval))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2023-01-19&to=2023-01-23&type=c))

[@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2023-01-19..2023-01-23&type=Issues)

## 2023.1.19

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/application@1.31.1...2485c99523f14772f9520c0879c4404328ae1d7d))

### Enhancements made

- Add content-visibility hide mode [#497](https://github.com/jupyterlab/lumino/pull/497) ([@krassowski](https://github.com/krassowski))

### Maintenance and upkeep improvements

- Bump versions for 1.x [#519](https://github.com/jupyterlab/lumino/pull/519) ([@fcollonval](https://github.com/fcollonval))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2022-12-13&to=2023-01-19&type=c))

[@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2022-12-13..2023-01-19&type=Issues) | [@krassowski](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Akrassowski+updated%3A2022-12-13..2023-01-19&type=Issues) | [@welcome](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Awelcome+updated%3A2022-12-13..2023-01-19&type=Issues)

## 2022.12.13

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/application@1.31.0...80999a0e9fe4d518602822fcc1baefd0c27cfd22))

### Bugs fixed

- Fix finding dependents for deactivation [#490](https://github.com/jupyterlab/lumino/pull/490) ([@fcollonval](https://github.com/fcollonval))

### Maintenance and upkeep improvements

- Bump @lumino/application [#494](https://github.com/jupyterlab/lumino/pull/494) ([@fcollonval](https://github.com/fcollonval))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2022-12-05&to=2022-12-13&type=c))

[@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2022-12-05..2022-12-13&type=Issues)

## 2022.12.5

([Full Changelog](https://github.com/jupyterlab/lumino/compare/v2022.10.31...1c0765d67ca74988319b4567ed6c2951a45b97f3))

### Enhancements made

- Dynamic extensions reloading [#377](https://github.com/jupyterlab/lumino/pull/377) ([@fcollonval](https://github.com/fcollonval))
- Improve the menubar accessibility [#476](https://github.com/jupyterlab/lumino/pull/476) ([@fcollonval](https://github.com/fcollonval))

### Bugs fixed

- Fix drag-and-drop of nested dock panel [#473](https://github.com/jupyterlab/lumino/pull/473) ([@drcd1](https://github.com/drcd1))

### Maintenance and upkeep improvements

- Bump version [#486](https://github.com/jupyterlab/lumino/pull/486) ([@fcollonval](https://github.com/fcollonval))
- Correct example version for 1.x [#479](https://github.com/jupyterlab/lumino/pull/479) ([@fcollonval](https://github.com/fcollonval))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2022-10-31&to=2022-12-05&type=c))

[@afshin](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aafshin+updated%3A2022-10-31..2022-12-05&type=Issues) | [@blink1073](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ablink1073+updated%3A2022-10-31..2022-12-05&type=Issues) | [@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2022-10-31..2022-12-05&type=Issues) | [@meeseeksmachine](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ameeseeksmachine+updated%3A2022-10-31..2022-12-05&type=Issues) | [@scmmmh](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ascmmmh+updated%3A2022-10-31..2022-12-05&type=Issues) | [@vidartf](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Avidartf+updated%3A2022-10-31..2022-12-05&type=Issues) | [@welcome](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Awelcome+updated%3A2022-10-31..2022-12-05&type=Issues)

## 2022.10.31

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/application@1.29.4...8362e3daa3afac6b2e832b5bd225b662bdbd6593))

### Enhancements made

- Add blocking signal feature [#443](https://github.com/jupyterlab/lumino/pull/443) ([@fcollonval](https://github.com/fcollonval))
- Add plugin description [#419](https://github.com/jupyterlab/lumino/pull/419) ([@fcollonval](https://github.com/fcollonval))
- Add support for list of keystrokes [#433](https://github.com/jupyterlab/lumino/pull/433) ([@fcollonval](https://github.com/fcollonval))
- Add `describedBy` to command [#322](https://github.com/jupyterlab/lumino/pull/322) ([@fcollonval](https://github.com/fcollonval))
- Fix tab trap in menubar [#373](https://github.com/jupyterlab/lumino/pull/373) ([@gabalafou](https://github.com/gabalafou))

### Bugs fixed

- Avoid menu layout trashing by moving DOM queries [#432](https://github.com/jupyterlab/lumino/pull/432) ([@krassowski](https://github.com/krassowski))

### Maintenance and upkeep improvements

- Update versions [#452](https://github.com/jupyterlab/lumino/pull/452) ([@fcollonval](https://github.com/fcollonval))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2022-10-05&to=2022-10-31&type=c))

[@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2022-10-05..2022-10-31&type=Issues) | [@krassowski](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Akrassowski+updated%3A2022-10-05..2022-10-31&type=Issues) | [@meeseeksdev](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ameeseeksdev+updated%3A2022-10-05..2022-10-31&type=Issues) | [@meeseeksmachine](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ameeseeksmachine+updated%3A2022-10-05..2022-10-31&type=Issues) | [@vidartf](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Avidartf+updated%3A2022-10-05..2022-10-31&type=Issues) | [@welcome](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Awelcome+updated%3A2022-10-05..2022-10-31&type=Issues)

## 2022.10.5

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/algorithm@1.9.2...013594a89254d533b687d98e61dde5a537acc1c1))

### Enhancements made

- Improve title on accordion label [#406](https://github.com/jupyterlab/lumino/pull/406) ([@fcollonval](https://github.com/fcollonval))

### Bugs fixed

- Fix labelledby to support multiple elements on page [#407](https://github.com/jupyterlab/lumino/pull/407) ([@fcollonval](https://github.com/fcollonval))

### Maintenance and upkeep improvements

- Add deprecation warnings [#425](https://github.com/jupyterlab/lumino/pull/425) ([@fcollonval](https://github.com/fcollonval))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2022-08-08&to=2022-10-05&type=c))

[@afshin](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aafshin+updated%3A2022-08-08..2022-10-05&type=Issues) | [@blink1073](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ablink1073+updated%3A2022-08-08..2022-10-05&type=Issues) | [@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2022-08-08..2022-10-05&type=Issues) | [@ibdafna](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aibdafna+updated%3A2022-08-08..2022-10-05&type=Issues) | [@jasongrout](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ajasongrout+updated%3A2022-08-08..2022-10-05&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3AmartinRenou+updated%3A2022-08-08..2022-10-05&type=Issues) | [@meeseeksdev](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ameeseeksdev+updated%3A2022-08-08..2022-10-05&type=Issues) | [@meeseeksmachine](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ameeseeksmachine+updated%3A2022-08-08..2022-10-05&type=Issues) | [@vidartf](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Avidartf+updated%3A2022-08-08..2022-10-05&type=Issues) | [@welcome](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Awelcome+updated%3A2022-08-08..2022-10-05&type=Issues)

## 2022.8.8

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/polling@1.11.0...3f98b0ec04e54ed9fef96e03898c82884878b663))

### Enhancements made

- Add `collapse` and `expand` methods to `AccordionPanel` [#321](https://github.com/jupyterlab/lumino/pull/321) ([@fcollonval](https://github.com/fcollonval))

### Documentation improvements

- Update my name and email [#323](https://github.com/jupyterlab/lumino/pull/323) ([@afshin](https://github.com/afshin))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2022-07-21&to=2022-08-08&type=c))

[@afshin](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aafshin+updated%3A2022-07-21..2022-08-08&type=Issues) | [@blink1073](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ablink1073+updated%3A2022-07-21..2022-08-08&type=Issues) | [@bollwyvl](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Abollwyvl+updated%3A2022-07-21..2022-08-08&type=Issues) | [@ellisonbg](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aellisonbg+updated%3A2022-07-21..2022-08-08&type=Issues) | [@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2022-07-21..2022-08-08&type=Issues) | [@ian-r-rose](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aian-r-rose+updated%3A2022-07-21..2022-08-08&type=Issues) | [@jweill-aws](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ajweill-aws+updated%3A2022-07-21..2022-08-08&type=Issues) | [@meeseeksmachine](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ameeseeksmachine+updated%3A2022-07-21..2022-08-08&type=Issues) | [@SylvainCorlay](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3ASylvainCorlay+updated%3A2022-07-21..2022-08-08&type=Issues) | [@vidartf](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Avidartf+updated%3A2022-07-21..2022-08-08&type=Issues)

## 2022.7.21

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/application@1.29.2...58fc58d365a1f71321ddd3d2d6a320d1ad1ebdde))

### Enhancements made

- Support arguments for rate-limited functions [#316](https://github.com/jupyterlab/lumino/pull/316) ([@afshin](https://github.com/afshin))

### Maintenance and upkeep improvements

- Bump terser from 5.7.1 to 5.14.2 [#315](https://github.com/jupyterlab/lumino/pull/315) ([@dependabot](https://github.com/dependabot))
- Add the need to set _New Version Spec_ when using the releaser [#314](https://github.com/jupyterlab/lumino/pull/314) ([@fcollonval](https://github.com/fcollonval))
- Don't run CI twice on PR from this repository [#313](https://github.com/jupyterlab/lumino/pull/313) ([@fcollonval](https://github.com/fcollonval))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2022-07-06&to=2022-07-21&type=c))

[@afshin](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aafshin+updated%3A2022-07-06..2022-07-21&type=Issues) | [@dependabot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adependabot+updated%3A2022-07-06..2022-07-21&type=Issues) | [@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2022-07-06..2022-07-21&type=Issues)

## 2022.7.6

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/application@1.29.1...69dd9933226562ffe8da8d20890175842df95eda))

### Bugs fixed

- [memory-leak] Title.changed not cleared when owner is disposed [#308](https://github.com/jupyterlab/lumino/pull/308) ([@fcollonval](https://github.com/fcollonval))

### Maintenance and upkeep improvements

- Bump shell-quote from 1.7.2 to 1.7.3 [#310](https://github.com/jupyterlab/lumino/pull/310) ([@dependabot](https://github.com/dependabot))
- Bump parse-url from 6.0.0 to 6.0.2 [#309](https://github.com/jupyterlab/lumino/pull/309) ([@dependabot](https://github.com/dependabot))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2022-06-07&to=2022-07-06&type=c))

[@dependabot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adependabot+updated%3A2022-06-07..2022-07-06&type=Issues) | [@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2022-06-07..2022-07-06&type=Issues)

## 2022.6.7

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/application@1.29.0...30a88f463778ad44ebbe8034622db3a76fbdc540))

### Bugs fixed

- Fix Accordion sizing issue [#304](https://github.com/jupyterlab/lumino/pull/304) ([@trungleduc](https://github.com/trungleduc))

### Maintenance and upkeep improvements

- Enable bot PRs to auto-label [#306](https://github.com/jupyterlab/lumino/pull/306) ([@blink1073](https://github.com/blink1073))
- Bump semver-regex from 3.1.3 to 3.1.4 [#305](https://github.com/jupyterlab/lumino/pull/305) ([@dependabot](https://github.com/dependabot))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2022-05-12&to=2022-06-07&type=c))

[@blink1073](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ablink1073+updated%3A2022-05-12..2022-06-07&type=Issues) | [@dependabot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adependabot+updated%3A2022-05-12..2022-06-07&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Atrungleduc+updated%3A2022-05-12..2022-06-07&type=Issues) | [@welcome](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Awelcome+updated%3A2022-05-12..2022-06-07&type=Issues)

## 2022.5.12

([Full Changelog](https://github.com/jupyterlab/lumino/compare/v2022.1.13...9c2948ed094b089f1c948300dfdf1f85fff4b83c))

### Enhancements made

- Add handle moved signal to split panel [#301](https://github.com/jupyterlab/lumino/pull/301) ([@afshin](https://github.com/afshin))

### Maintenance and upkeep improvements

- Bump async from 2.6.3 to 2.6.4 [#302](https://github.com/jupyterlab/lumino/pull/302) ([@dependabot](https://github.com/dependabot))
- Bump minimist from 1.2.5 to 1.2.6 [#296](https://github.com/jupyterlab/lumino/pull/296) ([@dependabot](https://github.com/dependabot))
- Bump karma from 6.3.14 to 6.3.16 [#295](https://github.com/jupyterlab/lumino/pull/295) ([@dependabot](https://github.com/dependabot))
- Bump follow-redirects from 1.14.7 to 1.14.8 [#294](https://github.com/jupyterlab/lumino/pull/294) ([@dependabot](https://github.com/dependabot))
- Bump node-fetch from 2.6.1 to 2.6.7 [#293](https://github.com/jupyterlab/lumino/pull/293) ([@dependabot](https://github.com/dependabot))
- Bump karma from 6.3.4 to 6.3.14 [#292](https://github.com/jupyterlab/lumino/pull/292) ([@dependabot](https://github.com/dependabot))
- Bump trim-off-newlines from 1.0.1 to 1.0.3 [#288](https://github.com/jupyterlab/lumino/pull/288) ([@dependabot](https://github.com/dependabot))
- Bump log4js from 6.3.0 to 6.4.0 [#287](https://github.com/jupyterlab/lumino/pull/287) ([@dependabot](https://github.com/dependabot))
- Bump shelljs from 0.8.4 to 0.8.5 [#286](https://github.com/jupyterlab/lumino/pull/286) ([@dependabot](https://github.com/dependabot))
- Bump engine.io from 4.1.1 to 4.1.2 [#284](https://github.com/jupyterlab/lumino/pull/284) ([@dependabot](https://github.com/dependabot))
- Bump follow-redirects from 1.14.1 to 1.14.7 [#282](https://github.com/jupyterlab/lumino/pull/282) ([@dependabot](https://github.com/dependabot))

### Documentation improvements

- chore: Add Web Component external example to README.md [#299](https://github.com/jupyterlab/lumino/pull/299) ([@GordonSmith](https://github.com/GordonSmith))
- Improve DockLayout code documentation [#285](https://github.com/jupyterlab/lumino/pull/285) ([@fcollonval](https://github.com/fcollonval))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2022-01-13&to=2022-05-12&type=c))

[@afshin](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aafshin+updated%3A2022-01-13..2022-05-12&type=Issues) | [@ajbozarth](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aajbozarth+updated%3A2022-01-13..2022-05-12&type=Issues) | [@blink1073](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ablink1073+updated%3A2022-01-13..2022-05-12&type=Issues) | [@dependabot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adependabot+updated%3A2022-01-13..2022-05-12&type=Issues) | [@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2022-01-13..2022-05-12&type=Issues) | [@GordonSmith](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3AGordonSmith+updated%3A2022-01-13..2022-05-12&type=Issues)

## 2022.1.13

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/application@1.28.0...f7d36a8bac6c44ee9928ea918d3473e297853658))

### Bugs fixed

- fix(DockLayout): Invalid use of "this" in private namespace [#281](https://github.com/jupyterlab/lumino/pull/281) ([@GordonSmith](https://github.com/GordonSmith))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2022-01-10&to=2022-01-13&type=c))

[@GordonSmith](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3AGordonSmith+updated%3A2022-01-10..2022-01-13&type=Issues)

## 2022.1.10

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/application@1.27.1...68ba69cdf8233576f103f24caf8e3a47ca6c69f6))

### Enhancements made

- chore(Widget): Simplify attach/detach sanity checking [#279](https://github.com/jupyterlab/lumino/pull/279) ([@GordonSmith](https://github.com/GordonSmith))
- fix(TabBar): Event forwarding fails when hosted in a ShadowRoot [#276](https://github.com/jupyterlab/lumino/pull/276) ([@GordonSmith](https://github.com/GordonSmith))
- fix(DockPanel): Drag and Drop fails when hosted in a ShadowRoot [#275](https://github.com/jupyterlab/lumino/pull/275) ([@GordonSmith](https://github.com/GordonSmith))

### Bugs fixed

- Prevent opening an empty menu [#277](https://github.com/jupyterlab/lumino/pull/277) ([@hbcarlos](https://github.com/hbcarlos))

### Maintenance and upkeep improvements

- chore(coreutils): Refactor Node v Browser builds [#274](https://github.com/jupyterlab/lumino/pull/274) ([@GordonSmith](https://github.com/GordonSmith))
- Update references to main branch (`master` → `main`) [#272](https://github.com/jupyterlab/lumino/pull/272) ([@krassowski](https://github.com/krassowski))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2021-12-13&to=2022-01-10&type=c))

[@blink1073](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ablink1073+updated%3A2021-12-13..2022-01-10&type=Issues) | [@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2021-12-13..2022-01-10&type=Issues) | [@GordonSmith](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3AGordonSmith+updated%3A2021-12-13..2022-01-10&type=Issues) | [@hbcarlos](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ahbcarlos+updated%3A2021-12-13..2022-01-10&type=Issues) | [@krassowski](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Akrassowski+updated%3A2021-12-13..2022-01-10&type=Issues)

## 2021.12.13

([Full Changelog](https://github.com/jupyterlab/lumino/compare/v2021.11.4...44b44a408e0849857cc7a7e639b5b0be00ae61ec)

- Enforce labels on PRs by @blink1073 in https://github.com/jupyterlab/lumino/pull/267
- Fix transposed display names for arrow keys by @thomasjm in https://github.com/jupyterlab/lumino/pull/268

## 2021.11.4

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/algorithm@1.9.0...6720e2482ac4cd7d7ee7918ecb33cb6a16642d99))

### Enhancements made

- Use composition to improve tab switch [#231](https://github.com/jupyterlab/lumino/pull/231) ([@fcollonval](https://github.com/fcollonval))

### Bugs fixed

- Format keyboard shortcuts according to OS conventions [#258](https://github.com/jupyterlab/lumino/pull/258) ([@jasongrout](https://github.com/jasongrout))

### Maintenance and upkeep improvements

- Run tests on macOS. [#259](https://github.com/jupyterlab/lumino/pull/259) ([@jasongrout](https://github.com/jasongrout))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2021-10-25&to=2021-11-04&type=c))

[@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2021-10-25..2021-11-04&type=Issues) | [@jasongrout](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ajasongrout+updated%3A2021-10-25..2021-11-04&type=Issues)

## 2021.10.25

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/algorithm@1.8.0...1ae240e236e596f8162a58c0289642ab4f392c52))

### Enhancements made

- Add arrow glyph handling to command registry [#252](https://github.com/jupyterlab/lumino/pull/252) ([@PlatinumCD](https://github.com/PlatinumCD))
- Added `PointerEvents` handling to `SplitPanel` [#251](https://github.com/jupyterlab/lumino/pull/251) ([@martaszmit](https://github.com/martaszmit))
- Ignore `keydown` events for modifier keys when accumulating key sequence [#245](https://github.com/jupyterlab/lumino/pull/245) ([@ph-ph](https://github.com/ph-ph))

### Bugs fixed

- Update title appropriately in `AccordionPanel` [#249](https://github.com/jupyterlab/lumino/pull/249) ([@hbcarlos](https://github.com/hbcarlos))

### Maintenance and upkeep improvements

- Add linter check in CI [#242](https://github.com/jupyterlab/lumino/pull/242) ([@fcollonval](https://github.com/fcollonval))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2021-09-30&to=2021-10-25&type=c))

[@blink1073](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ablink1073+updated%3A2021-09-30..2021-10-25&type=Issues) | [@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2021-09-30..2021-10-25&type=Issues) | [@hbcarlos](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ahbcarlos+updated%3A2021-09-30..2021-10-25&type=Issues) | [@martaszmit](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Amartaszmit+updated%3A2021-09-30..2021-10-25&type=Issues) | [@ph-ph](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aph-ph+updated%3A2021-09-30..2021-10-25&type=Issues) | [@PlatinumCD](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3APlatinumCD+updated%3A2021-09-30..2021-10-25&type=Issues) | [@welcome](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Awelcome+updated%3A2021-09-30..2021-10-25&type=Issues)

## 2021.9.30

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/algorithm@1.7.0...e6612f622c827b2e85cffb1858fcc3bf1b09be76))

### Enhancements made

- Basic Touch Events [#123](https://github.com/jupyterlab/lumino/pull/123) ([@bign8](https://github.com/bign8))

### Maintenance and upkeep improvements

- Optimise grid rendering [#239](https://github.com/jupyterlab/lumino/pull/239) ([@ibdafna](https://github.com/ibdafna))

### Documentation improvements

- Add static examples in docs [#241](https://github.com/jupyterlab/lumino/pull/241) ([@blink1073](https://github.com/blink1073))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2021-09-22&to=2021-09-30&type=c))

[@bign8](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Abign8+updated%3A2021-09-22..2021-09-30&type=Issues) | [@blink1073](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ablink1073+updated%3A2021-09-22..2021-09-30&type=Issues) | [@ibdafna](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aibdafna+updated%3A2021-09-22..2021-09-30&type=Issues) | [@jupyterlab-probot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ajupyterlab-probot+updated%3A2021-09-22..2021-09-30&type=Issues)

## 2021.9.22

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/signaling@1.7.2...520444449e74a37a82c34fdf51c70c60059733b3))

### Bugs fixed

- Remove deprecated MediaStreamErrorEvent [#237](https://github.com/jupyterlab/lumino/pull/237) ([@afshin](https://github.com/afshin))
- Class and aria attribute must be changed on title [#232](https://github.com/jupyterlab/lumino/pull/232) ([@fcollonval](https://github.com/fcollonval))

### Maintenance and upkeep improvements

- Add binder link to Readme [#229](https://github.com/jupyterlab/lumino/pull/229) ([@blink1073](https://github.com/blink1073))
- Add binder configuration [#226](https://github.com/jupyterlab/lumino/pull/226) ([@blink1073](https://github.com/blink1073))

### Documentation improvements

- Add screencasts and examples to the README [#234](https://github.com/jupyterlab/lumino/pull/234) ([@jtpio](https://github.com/jtpio))

### Other merged PRs

- Add linter [#230](https://github.com/jupyterlab/lumino/pull/230) ([@fcollonval](https://github.com/fcollonval))
- Bump tar from 4.4.15 to 4.4.19 [#225](https://github.com/jupyterlab/lumino/pull/225) ([@dependabot](https://github.com/dependabot))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2021-08-23&to=2021-09-22&type=c))

[@afshin](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aafshin+updated%3A2021-08-23..2021-09-22&type=Issues) | [@blink1073](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ablink1073+updated%3A2021-08-23..2021-09-22&type=Issues) | [@dependabot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adependabot+updated%3A2021-08-23..2021-09-22&type=Issues) | [@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2021-08-23..2021-09-22&type=Issues) | [@jtpio](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ajtpio+updated%3A2021-08-23..2021-09-22&type=Issues) | [@jupyterlab-probot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ajupyterlab-probot+updated%3A2021-08-23..2021-09-22&type=Issues)

## 2021.8.23

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/algorithm@1.6.1...f765c6160f2a4be5ffaccbc590bf7e0d54675ab5))

### Enhancements made

- Add 'padding' argument to fitColumnNames function [#223](https://github.com/jupyterlab/lumino/pull/223) ([@ibdafna](https://github.com/ibdafna))

### Maintenance and upkeep improvements

- Use Check Links Action [#222](https://github.com/jupyterlab/lumino/pull/222) ([@blink1073](https://github.com/blink1073))

### Documentation improvements

- Update release notes [#220](https://github.com/jupyterlab/lumino/pull/220) ([@blink1073](https://github.com/blink1073))

### Other merged PRs

- Add auto-resize function for column widths [#221](https://github.com/jupyterlab/lumino/pull/221) ([@ibdafna](https://github.com/ibdafna))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2021-08-12&to=2021-08-23&type=c))

[@blink1073](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ablink1073+updated%3A2021-08-12..2021-08-23&type=Issues) | [@ibdafna](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aibdafna+updated%3A2021-08-12..2021-08-23&type=Issues)

## 2021.8.12

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/application@1.23.0...5bd6fe37c0351e48c7e72a9ccb01927a30473020))

### Enhancements made

- New renderer: HyperlinkRenderer [#218](https://github.com/jupyterlab/lumino/pull/218) ([@ibdafna](https://github.com/ibdafna))

### Maintenance and upkeep improvements

- Update dependencies [#217](https://github.com/jupyterlab/lumino/pull/217) ([@afshin](https://github.com/afshin))
- Fix handling of pip cache in CI [#216](https://github.com/jupyterlab/lumino/pull/216) ([@blink1073](https://github.com/blink1073))

### Other merged PRs

- Bump tar from 4.4.13 to 4.4.15 [#215](https://github.com/jupyterlab/lumino/pull/215) ([@dependabot](https://github.com/dependabot))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2021-08-03&to=2021-08-12&type=c))

[@afshin](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aafshin+updated%3A2021-08-03..2021-08-12&type=Issues) | [@blink1073](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ablink1073+updated%3A2021-08-03..2021-08-12&type=Issues) | [@dependabot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adependabot+updated%3A2021-08-03..2021-08-12&type=Issues) | [@ibdafna](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aibdafna+updated%3A2021-08-03..2021-08-12&type=Issues)

## 2021.8.3

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/application@1.22.0...d54b9ebc5bc28fa3676c9482da3db5656840934b))

### Enhancements made

- Add accordion panel [#205](https://github.com/jupyterlab/lumino/pull/205) ([@fcollonval](https://github.com/fcollonval))

### Maintenance and upkeep improvements

- Make focus consistent with active element in menus [#187](https://github.com/jupyterlab/lumino/pull/187) ([@marthacryan](https://github.com/marthacryan))

### Documentation improvements

- Remove Errant Changelog Entry [#212](https://github.com/jupyterlab/lumino/pull/212) ([@blink1073](https://github.com/blink1073))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2021-07-23&to=2021-08-03&type=c))

[@blink1073](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ablink1073+updated%3A2021-07-23..2021-08-03&type=Issues) | [@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2021-07-23..2021-08-03&type=Issues) | [@marthacryan](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Amarthacryan+updated%3A2021-07-23..2021-08-03&type=Issues)

## 2021.7.23

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/example-datagrid@0.23.0...eee4eb491d5df940bead38b9dff7cba0a94ec482))

### Enhancements made

- Added option to force items' position [#208](https://github.com/jupyterlab/lumino/pull/208) ([@hbcarlos](https://github.com/hbcarlos))
- Add option to not group context menu item by target [#206](https://github.com/jupyterlab/lumino/pull/206) ([@fcollonval](https://github.com/fcollonval))

### Maintenance and upkeep improvements

- Fixes for Check Release [#210](https://github.com/jupyterlab/lumino/pull/210) ([@fcollonval](https://github.com/fcollonval))

### Documentation improvements

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2021-07-21&to=2021-07-23&type=c))

[@blink1073](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ablink1073+updated%3A2021-07-21..2021-07-23&type=Issues) | [@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2021-07-21..2021-07-23&type=Issues) | [@hbcarlos](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ahbcarlos+updated%3A2021-07-21..2021-07-23&type=Issues) | [@welcome](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Awelcome+updated%3A2021-07-21..2021-07-23&type=Issues)

## 2017.7.22

([Full Changelog](https://github.com/jupyterlab/lumino/compare/@lumino/example-datagrid@0.23.0...04b0cf32e49d1371f1c68228850a3941e5b0c6a2))

### Enhancements made

- Added option to force items' position [#208](https://github.com/jupyterlab/lumino/pull/208) ([@hbcarlos](https://github.com/hbcarlos))
- Add option to not group context menu item by target [#206](https://github.com/jupyterlab/lumino/pull/206) ([@fcollonval](https://github.com/fcollonval))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2021-07-21&to=2021-07-22&type=c))

[@fcollonval](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Afcollonval+updated%3A2021-07-21..2021-07-22&type=Issues) | [@hbcarlos](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ahbcarlos+updated%3A2021-07-21..2021-07-22&type=Issues) | [@welcome](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Awelcome+updated%3A2021-07-21..2021-07-22&type=Issues)

## 2021.7.19

([Full Changelog](https://github.com/jupyterlab/lumino/compare/v2021.6.10...52aee424552e8af82d65fcd8a18b6e80ca5fab77))

### Documentation improvements

### Other merged PRs

- Bump color-string from 1.5.3 to 1.6.0 [#200](https://github.com/jupyterlab/lumino/pull/200) ([@dependabot](https://github.com/dependabot))
- Simplify rendering logic for grids with merged cells [#197](https://github.com/jupyterlab/lumino/pull/197) ([@ibdafna](https://github.com/ibdafna))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2021-06-10&to=2021-07-19&type=c))

[@blink1073](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ablink1073+updated%3A2021-06-10..2021-07-19&type=Issues) | [@dependabot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adependabot+updated%3A2021-06-10..2021-07-19&type=Issues) | [@ibdafna](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aibdafna+updated%3A2021-06-10..2021-07-19&type=Issues)

## 2021.6.10

([Full Changelog](https://github.com/jupyterlab/lumino/compare/2021.5.20...6c6cf684d121896d971b9f970a095e2a127fe2cb))

### Bugs fixed

- Remove Chrome default scroll on focus [#190](https://github.com/jupyterlab/lumino/pull/190) ([@ibdafna](https://github.com/ibdafna))

### Maintenance and upkeep improvements

- Bump dot-prop from 4.2.0 to 4.2.1 [#194](https://github.com/jupyterlab/lumino/pull/194) ([@dependabot](https://github.com/dependabot))
- Bump lodash from 4.17.19 to 4.17.21 [#193](https://github.com/jupyterlab/lumino/pull/193) ([@dependabot](https://github.com/dependabot))
- Bump handlebars from 4.5.3 to 4.7.7 [#192](https://github.com/jupyterlab/lumino/pull/192) ([@dependabot](https://github.com/dependabot))
- Update Lerna Dependency [#191](https://github.com/jupyterlab/lumino/pull/191) ([@afshin](https://github.com/afshin))
- Use Jupyter releaser [#186](https://github.com/jupyterlab/lumino/pull/186) ([@afshin](https://github.com/afshin))

### Documentation improvements

### Other merged PRs

- Bump browserslist from 4.8.3 to 4.16.6 [#188](https://github.com/jupyterlab/lumino/pull/188) ([@dependabot](https://github.com/dependabot))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2021-05-20&to=2021-06-10&type=c))

[@afshin](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aafshin+updated%3A2021-05-20..2021-06-10&type=Issues) | [@blink1073](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ablink1073+updated%3A2021-05-20..2021-06-10&type=Issues) | [@dependabot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adependabot+updated%3A2021-05-20..2021-06-10&type=Issues) | [@ibdafna](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aibdafna+updated%3A2021-05-20..2021-06-10&type=Issues)

## 2021-5-20

([Full Changelog](https://github.com/jupyterlab/lumino/compare/2021.5.10...e2b775392b42e98d5c58b9afdc74e92b1631739b))

    @lumino/datagrid: 0.24.0 => 0.25.0

### Enhancements made

- Cell merging [#124](https://github.com/jupyterlab/lumino/pull/124) ([@ibdafna](https://github.com/ibdafna))

### Maintenance and upkeep improvements

- Bump codemirror from 5.49.2 to 5.58.2 [#183](https://github.com/jupyterlab/lumino/pull/183) ([@dependabot](https://github.com/dependabot))
- Bump hosted-git-info from 2.8.5 to 2.8.9 [#182](https://github.com/jupyterlab/lumino/pull/182) ([@dependabot](https://github.com/dependabot))

### Documentation improvements

- Fix changelog formatting for 2021-5-10 entry [#185](https://github.com/jupyterlab/lumino/pull/185) ([@blink1073](https://github.com/blink1073))
- Add changelog entry for 2021.5.10 [#184](https://github.com/jupyterlab/lumino/pull/184) ([@blink1073](https://github.com/blink1073))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2021-05-10&to=2021-05-20&type=c))

[@blink1073](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ablink1073+updated%3A2021-05-10..2021-05-20&type=Issues) | [@dependabot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adependabot+updated%3A2021-05-10..2021-05-20&type=Issues) | [@ibdafna](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aibdafna+updated%3A2021-05-10..2021-05-20&type=Issues)

## 2021-5-10

([Full Changelog](https://github.com/jupyterlab/lumino/compare/2021.4.27...f8466b274fe801bb06931572893fb938808eb2b8))

    @lumino/application: 1.19.0 => 1.20.0
    @lumino/datagrid: 0.23.0 => 0.24.0
    @lumino/default-theme: 0.13.0 => 0.14.0
    @lumino/widgets: 1.22.0 => 1.23.0

### Enhancements made

- Implement plus button on TabBar [#108](https://github.com/jupyterlab/lumino/pull/108) ([@nmichaud](https://github.com/nmichaud))

### Bugs fixed

- Fix selection mode [#179](https://github.com/jupyterlab/lumino/pull/179) ([@ibdafna](https://github.com/ibdafna))

### Maintenance and upkeep improvements

- Respect closable attribute on title [#178](https://github.com/jupyterlab/lumino/pull/178) ([@nmichaud](https://github.com/nmichaud))
- Bump underscore from 1.9.1 to 1.13.1 [#181](https://github.com/jupyterlab/lumino/pull/181) ([@dependabot](https://github.com/dependabot))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2021-04-27&to=2021-05-10&type=c))

[@afshin](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aafshin+updated%3A2021-04-27..2021-05-10&type=Issues) | [@dependabot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adependabot+updated%3A2021-04-27..2021-05-10&type=Issues) | [@ellisonbg](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aellisonbg+updated%3A2021-04-27..2021-05-10&type=Issues) | [@ibdafna](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aibdafna+updated%3A2021-04-27..2021-05-10&type=Issues) | [@nmichaud](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Anmichaud+updated%3A2021-04-27..2021-05-10&type=Issues)

## 2021-4-27

([Full Changelog](https://github.com/jupyterlab/lumino/compare/2012.4.19...f4d7e30f37e3bb362b89865a6ce24779c11e91bc))

    @lumino/algorithm: 1.5.0 => 1.6.0
    @lumino/application: 1.18.0 => 1.19.0
    @lumino/collections: 1.5.0 => 1.6.0
    @lumino/commands: 1.14.0 => 1.15.0
    @lumino/coreutils: 1.7.0 => 1.8.0
    @lumino/datagrid: 0.22.0 => 0.23.0
    @lumino/datastore: 0.13.0 => 0.14.0
    @lumino/default-theme: 0.12.0 => 0.13.0
    @lumino/disposable: 1.6.0 => 1.7.0
    @lumino/domutils: 1.4.0 => 1.5.0
    @lumino/dragdrop: 1.9.0 => 1.10.0
    @lumino/keyboard: 1.4.0 => 1.5.0
    @lumino/messaging: 1.6.0 => 1.7.0
    @lumino/polling: 1.5.0 => 1.6.0
    @lumino/properties: 1.4.0 => 1.5.0
    @lumino/signaling: 1.6.0 => 1.7.0
    @lumino/virtualdom: 1.10.0 => 1.11.0
    @lumino/widgets: 1.21.0 => 1.22.0

### Bugs fixed

- Normalize frequency max to respect interval at instantiation time [#177](https://github.com/jupyterlab/lumino/pull/177) ([@afshin](https://github.com/afshin))

### Documentation improvements

- Fix a minor typo in comment [#176](https://github.com/jupyterlab/lumino/pull/176) ([@cnydw](https://github.com/cnydw))

### Other merged PRs

- Switch back to TypeScript 3.6 [#175](https://github.com/jupyterlab/lumino/pull/175) ([@jtpio](https://github.com/jtpio))
- Fix tabindex for menu bar [#174](https://github.com/jupyterlab/lumino/pull/174) ([@marthacryan](https://github.com/marthacryan))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2021-04-19&to=2021-04-27&type=c))

[@afshin](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aafshin+updated%3A2021-04-19..2021-04-27&type=Issues) | [@cnydw](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Acnydw+updated%3A2021-04-19..2021-04-27&type=Issues) | [@jtpio](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ajtpio+updated%3A2021-04-19..2021-04-27&type=Issues) | [@marthacryan](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Amarthacryan+updated%3A2021-04-19..2021-04-27&type=Issues) | [@sccolbert](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Asccolbert+updated%3A2021-04-19..2021-04-27&type=Issues) | [@welcome](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Awelcome+updated%3A2021-04-19..2021-04-27&type=Issues)

## 2021-4-19

([Full Changelog](https://github.com/jupyterlab/lumino/compare/2021.4.12...fc0c0ddf950d38e957bfd1e076ffb937a679009f))

    @lumino/algorithm: 1.4.0 => 1.5.0
    @lumino/application: 1.17.0 => 1.18.0
    @lumino/collections: 1.4.0 => 1.5.0
    @lumino/commands: 1.13.0 => 1.14.0
    @lumino/coreutils: 1.6.0 => 1.7.0
    @lumino/datagrid: 0.21.1 => 0.22.0
    @lumino/datastore: 0.12.0 => 0.13.0
    @lumino/default-theme: 0.11.0 => 0.12.0
    @lumino/disposable: 1.5.0 => 1.6.0
    @lumino/domutils: 1.3.0 => 1.4.0
    @lumino/dragdrop: 1.8.0 => 1.9.0
    @lumino/keyboard: 1.3.0 => 1.4.0
    @lumino/messaging: 1.5.0 => 1.6.0
    @lumino/polling: 1.4.0 => 1.5.0
    @lumino/properties: 1.3.0 => 1.4.0
    @lumino/signaling: 1.5.0 => 1.6.0
    @lumino/virtualdom: 1.9.0 => 1.10.0
    @lumino/widgets: 1.20.0 => 1.21.0

### Merged PRs

- Add missing PR to changelog [#171](https://github.com/jupyterlab/lumino/pull/171) ([@blink1073](https://github.com/blink1073))
- Bump ssri from 6.0.1 to 6.0.2 [#173](https://github.com/jupyterlab/lumino/pull/173) ([@dependabot](https://github.com/dependabot))
- Switch to TypeScript 3.9 [#172](https://github.com/jupyterlab/lumino/pull/172) ([@jtpio](https://github.com/jtpio))
- Add exports for sectionlist and celleditorcontroller [#169](https://github.com/jupyterlab/lumino/pull/169) ([@ibdafna](https://github.com/ibdafna))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2021-04-12&to=2021-04-19&type=c))

[@blink1073](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ablink1073+updated%3A2021-04-12..2021-04-19&type=Issues) | [@dependabot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adependabot+updated%3A2021-04-12..2021-04-19&type=Issues) | [@ibdafna](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aibdafna+updated%3A2021-04-12..2021-04-19&type=Issues) | [@jtpio](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ajtpio+updated%3A2021-04-12..2021-04-19&type=Issues) | [@vidartf](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Avidartf+updated%3A2021-04-12..2021-04-19&type=Issues)

## 2021-4-12

([Full Changelog](https://github.com/jupyterlab/lumino/compare/2021.4.9...bcb9734e2f01e625a51de0e58a6c3e5577090d3b))

    @lumino/datagrid: 0.21.0 => 0.21.1

### Merged PRs

- Restore getter for `_pressData` [#167](https://github.com/jupyterlab/lumino/pull/167) ([@ibdafna](https://github.com/ibdafna))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2021-04-09&to=2021-04-12&type=c))

[@ibdafna](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aibdafna+updated%3A2021-04-09..2021-04-12&type=Issues)

## 2021-4-9

([Full Changelog](https://github.com/jupyterlab/lumino/compare/2021.3.11...f991ecd1a00df02fa6716e8b0b9f2a2f79a6237e))

    @lumino/algorithm: 1.3.3 => 1.4.0
    @lumino/application: 1.16.0 => 1.17.0
    @lumino/collections: 1.3.3 => 1.4.0
    @lumino/commands: 1.12.0 => 1.13.0
    @lumino/coreutils: 1.5.3 => 1.6.0
    @lumino/datagrid: 0.20.0 => 0.21.0
    @lumino/datastore: 0.11.0 => 0.12.0
    @lumino/default-theme: 0.10.0 => 0.11.0
    @lumino/disposable: 1.4.3 => 1.5.0
    @lumino/domutils: 1.2.3 => 1.3.0
    @lumino/dragdrop: 1.7.1 => 1.8.0
    @lumino/keyboard: 1.2.3 => 1.3.0
    @lumino/messaging: 1.4.3 => 1.5.0
    @lumino/polling: 1.3.3 => 1.4.0
    @lumino/properties: 1.2.3 => 1.3.0
    @lumino/signaling: 1.4.3 => 1.5.0
    @lumino/virtualdom: 1.8.0 => 1.9.0
    @lumino/widgets: 1.19.0 => 1.20.0

### Merged PRs

- Clean Up CI [#166](https://github.com/jupyterlab/lumino/pull/166) ([@jtpio](https://github.com/jtpio))
- Bump y18n from 4.0.0 to 4.0.1 [#164](https://github.com/jupyterlab/lumino/pull/164) ([@dependabot](https://github.com/dependabot))
- Ctrl-click to toggle single row or column selections [#163](https://github.com/jupyterlab/lumino/pull/163) ([@ibdafna](https://github.com/ibdafna))
- Update documentation badge [#162](https://github.com/jupyterlab/lumino/pull/162) ([@blink1073](https://github.com/blink1073))
- Change one BasicMouseHandler properties from private to protected [#161](https://github.com/jupyterlab/lumino/pull/161) ([@ibdafna](https://github.com/ibdafna))
- Update RTD Link to Point to Stable Version [#159](https://github.com/jupyterlab/lumino/pull/159) ([@blink1073](https://github.com/blink1073))
- Update Badges in Readme [#158](https://github.com/jupyterlab/lumino/pull/158) ([@blink1073](https://github.com/blink1073))
- Fix docs target for polling [#155](https://github.com/jupyterlab/lumino/pull/155) ([@bollwyvl](https://github.com/bollwyvl))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlab/lumino/graphs/contributors?from=2021-03-23&to=2021-04-09&type=c))

[@blink1073](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ablink1073+updated%3A2021-03-23..2021-04-09&type=Issues) | [@bollwyvl](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Abollwyvl+updated%3A2021-03-23..2021-04-09&type=Issues) | [@dependabot](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Adependabot+updated%3A2021-03-23..2021-04-09&type=Issues) | [@ibdafna](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Aibdafna+updated%3A2021-03-23..2021-04-09&type=Issues) | [@jtpio](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Ajtpio+updated%3A2021-03-23..2021-04-09&type=Issues) | [@welcome](https://github.com/search?q=repo%3Ajupyterlab%2Flumino+involves%3Awelcome+updated%3A2021-03-23..2021-04-09&type=Issues)

## 2021-3-11

    @lumino/application: 1.15.0 => 1.16.0
    @lumino/datagrid: 0.19.0 => 0.20.0
    @lumino/default-theme: 0.9.0 => 0.10.0
    @lumino/widgets: 1.18.0 => 1.19.0

- Add Sphinx Documentation [#157](https://github.com/jupyterlab/lumino/pull/157) ([@afshin](https://github.com/afshin))
- Bump elliptic from 6.5.3 to 6.5.4 [#156](https://github.com/jupyterlab/lumino/pull/156) ([@dependabot](https://github.com/dependabot))
- Add ARIA roles to tabs - lumino update [#132](https://github.com/jupyterlab/lumino/pull/132) ([@telamonian](https://github.com/telamonian))

## 2021-1-19

    @lumino/widgets@1.18.0
    @lumino/example-dockpanel@0.7.0
    @lumino/example-datastore@0.7.0
    @lumino/example-datagrid@0.16.0
    @lumino/default-theme@0.9.0
    @lumino/datagrid@0.19.0
    @lumino/application@1.15.0

- Allow passing of `tag` into `widget` constructor [#150](https://github.com/jupyterlab/lumino/pull/150) ([@telamonian](https://github.com/telamonian))
- Add checkbox aria role to toggleable commands [#149](https://github.com/jupyterlab/lumino/pull/149) ([@marthacryan](https://github.com/marthacryan))
- Remove leftover SectionResizeRequest [#148](https://github.com/jupyterlab/lumino/pull/148) ([@martinRenou](https://github.com/martinRenou))

## 2021-1-5

    @lumino/example-datagrid@0.15.0
    @lumino/datagrid@0.18.0

- DataGrid mouse handler: Expose pressData for subclasses [#146](https://github.com/jupyterlab/lumino/pull/146) ([@martinRenou](https://github.com/martinRenou))
- Make \_repaintRegion a protected method [#145](https://github.com/jupyterlab/lumino/pull/145) ([@martinRenou](https://github.com/martinRenou))
- Bump ini from 1.3.5 to 1.3.7 [#143](https://github.com/jupyterlab/lumino/pull/143) ([@dependabot](https://github.com/dependabot))

## 2020-12-11

    @lumino/widgets@1.17.0
    @lumino/example-dockpanel@0.6.0
    @lumino/example-datastore@0.6.0
    @lumino/example-datagrid@0.14.0
    @lumino/default-theme@0.8.0
    @lumino/datagrid@0.17.0
    @lumino/application@1.14.0

- Switch to GitHub Actions [#142](https://github.com/jupyterlab/lumino/pull/142) ([@afshin](https://github.com/afshin))
- Add text wrapping [#140](https://github.com/jupyterlab/lumino/pull/140) ([@ibdafna](https://github.com/ibdafna))
- Constrain tabs to their source DockPanel (opt-in) [#137](https://github.com/jupyterlab/lumino/pull/137) ([@piersdeseilligny](https://github.com/piersdeseilligny))

## 2020-12-3

    @lumino/widgets@1.16.1
    @lumino/example-dockpanel@0.5.1
    @lumino/example-datastore@0.5.1
    @lumino/example-datagrid@0.13.1
    @lumino/dragdrop@1.7.1
    @lumino/default-theme@0.7.1
    @lumino/datagrid@0.16.1
    @lumino/application@1.13.1

- Specify the CSS javascript module imports explicitly in package.json. [#139](https://github.com/jupyterlab/lumino/pull/139) ([@jasongrout](https://github.com/jasongrout))

## 2020-12-1

    @lumino/widgets@1.16.0
    @lumino/example-dockpanel@0.5.0
    @lumino/example-datastore@0.5.0
    @lumino/example-datagrid@0.13.0
    @lumino/dragdrop@1.7.0
    @lumino/default-theme@0.7.0
    @lumino/datagrid@0.16.0
    @lumino/application@1.13.0

- Add style index.js files to optionally consume the CSS via a js module import [#136](https://github.com/jupyterlab/lumino/pull/136) ([@jasongrout](https://github.com/jasongrout))

## 2020-11-30

    @lumino/widgets@1.15.0
    @lumino/virtualdom@1.8.0
    @lumino/example-dockpanel@0.4.0
    @lumino/example-datastore@0.4.0
    @lumino/example-datagrid@0.12.0
    @lumino/default-theme@0.6.0
    @lumino/datagrid@0.15.0
    @lumino/commands@1.12.0
    @lumino/application@1.12.0

- Bump highlight.js from 9.17.1 to 9.18.5 [#135](https://github.com/jupyterlab/lumino/pull/135) ([@dependabot](https://github.com/dependabot))
- Batch Add Items to Command Pallette [#133](https://github.com/jupyterlab/lumino/pull/133) ([@jhamet93](https://github.com/jhamet93))
- Add aria roles to menus [#131](https://github.com/jupyterlab/lumino/pull/131) ([@marthacryan](https://github.com/marthacryan))
- Add isToggleable command state [#129](https://github.com/jupyterlab/lumino/pull/129) ([@marthacryan](https://github.com/marthacryan))

## 2020-11-2

    @lumino/widgets@1.14.1
    @lumino/example-dockpanel@0.3.6
    @lumino/example-datastore@0.3.6
    @lumino/example-datagrid@0.11.1
    @lumino/default-theme@0.5.1
    @lumino/datagrid@0.14.1
    @lumino/commands@1.11.4
    @lumino/application@1.11.1

- Fix sluggish tab dragging in the tab bar. [#128](https://github.com/jupyterlab/lumino/pull/128) ([@subhav](https://github.com/subhav))
- Improve note about performance of commandExecuted handlers. [#127](https://github.com/jupyterlab/lumino/pull/127) ([@ellisonbg](https://github.com/ellisonbg))
- Bump node-fetch from 2.6.0 to 2.6.1 [#121](https://github.com/jupyterlab/lumino/pull/121) ([@dependabot](https://github.com/dependabot))
- Bump http-proxy from 1.18.0 to 1.18.1 [#120](https://github.com/jupyterlab/lumino/pull/120) ([@dependabot](https://github.com/dependabot))

## 2020-8-24

    @lumino/example-datagrid@0.11.0
    @lumino/datagrid@0.14.0

- Make private \_drawCornerHeaderRegion protected drawCornerHeaderRegion [#116](https://github.com/jupyterlab/lumino/pull/116) (@lmcnichols)
- Text eliding with ellipsis on datagrid text renderer [#105](https://github.com/jupyterlab/lumino/pull/105) ([@nmichaud](https://github.com/nmichaud))

## 2020-8-20

    @lumino/widgets@1.14.0
    @lumino/example-dockpanel@0.3.5
    @lumino/example-datastore@0.3.5
    @lumino/example-datagrid@0.10.0
    @lumino/default-theme@0.5.0
    @lumino/datastore@0.11.0
    @lumino/datagrid@0.13.0
    @lumino/application@1.11.0

- mouseDown now uses cell, column, and row selection modes [#114](https://github.com/jupyterlab/lumino/pull/114) ([@kgoo124](https://github.com/kgoo124))
- Double-click to edit tab title in TabBars [#112](https://github.com/jupyterlab/lumino/pull/112) ([@nmichaud](https://github.com/nmichaud))
- Give extending classes access to some of the data grid's paint utilities. [#111](https://github.com/jupyterlab/lumino/pull/111) (@lmcnichols)
- Fix for DockPanel.tabsMovable to set false to all tabs [#109](https://github.com/jupyterlab/lumino/pull/109) ([@nmichaud](https://github.com/nmichaud))
- Modified function spliceArray in datastore/src/listfield.ts so that it behaves like Array.splice on large inputs. [#101](https://github.com/jupyterlab/lumino/pull/101) (@lmcnichols)
- Bump elliptic from 6.5.2 to 6.5.3 [#99](https://github.com/jupyterlab/lumino/pull/99) ([@dependabot](https://github.com/dependabot))

## 2020-7-27

    @lumino/widgets@1.13.4
    @lumino/example-dockpanel@0.3.4
    @lumino/example-datastore@0.3.4
    @lumino/example-datagrid@0.9.0
    @lumino/dragdrop@1.6.4
    @lumino/default-theme@0.4.4
    @lumino/datagrid@0.12.0
    @lumino/application@1.10.4

- Change the Drag class's private method \_moveDragImage to a public method moveDragImage. [#96](https://github.com/jupyterlab/lumino/pull/96) (@lmcnichols)

## 2020-7-21

    @lumino/widgets@1.13.3
    @lumino/virtualdom@1.7.3
    @lumino/signaling@1.4.3
    @lumino/properties@1.2.3
    @lumino/polling@1.3.3
    @lumino/messaging@1.4.3
    @lumino/keyboard@1.2.3
    @lumino/example-dockpanel@0.3.3
    @lumino/example-datastore@0.3.3
    @lumino/example-datagrid@0.8.1
    @lumino/dragdrop@1.6.3
    @lumino/domutils@1.2.3
    @lumino/disposable@1.4.3
    @lumino/default-theme@0.4.3
    @lumino/datastore@0.10.3
    @lumino/datagrid@0.11.1
    @lumino/coreutils@1.5.3
    @lumino/commands@1.11.3
    @lumino/collections@1.3.3
    @lumino/application@1.10.3
    @lumino/algorithm@1.3.3

- Have the DataGrid syncViewport when receiving a DataModel.ChangedArgs signal of type "rows-moved" or "columns-moved" [#94](https://github.com/jupyterlab/lumino/pull/94) (@lmcnichols)

## 2020-7-21

    @lumino/example-datagrid@0.8.0
    @lumino/datagrid@0.11.0

- Make cursorForHandle and it's argument type accessible from outside BasicMouseHandler. [#92](https://github.com/jupyterlab/lumino/pull/92) (@lmcnichols)
- Bump lodash from 4.17.15 to 4.17.19 [#90](https://github.com/jupyterlab/lumino/pull/90) ([@dependabot](https://github.com/dependabot))

## 2020-7-5

    @lumino/example-datagrid@0.7.0
    @lumino/datagrid@0.10.0

- CellEditors now render in front of the DataGrid [#87](https://github.com/jupyterlab/lumino/pull/87) ([@kgoo124](https://github.com/kgoo124))

## 2020-6-26

    @lumino/widgets@1.13.2
    @lumino/virtualdom@1.7.2
    @lumino/signaling@1.4.2
    @lumino/properties@1.2.2
    @lumino/polling@1.3.2
    @lumino/messaging@1.4.2
    @lumino/keyboard@1.2.2
    @lumino/example-dockpanel@0.3.2
    @lumino/example-datastore@0.3.2
    @lumino/example-datagrid@0.6.1
    @lumino/dragdrop@1.6.2
    @lumino/domutils@1.2.2
    @lumino/disposable@1.4.2
    @lumino/default-theme@0.4.2
    @lumino/datastore@0.10.2
    @lumino/datagrid@0.9.1
    @lumino/coreutils@1.5.2
    @lumino/commands@1.11.2
    @lumino/collections@1.3.2
    @lumino/application@1.10.2
    @lumino/algorithm@1.3.2

- Revert "chore(build): Bump Typescript to 3.9.2" [#84](https://github.com/jupyterlab/lumino/pull/84) ([@telamonian](https://github.com/telamonian))

## 2020-6-24

    @lumino/widgets@1.13.1
    @lumino/virtualdom@1.7.1
    @lumino/signaling@1.4.1
    @lumino/properties@1.2.1
    @lumino/polling@1.3.1
    @lumino/messaging@1.4.1
    @lumino/keyboard@1.2.1
    @lumino/example-dockpanel@0.3.1
    @lumino/example-datastore@0.3.1
    @lumino/example-datagrid@0.6.0
    @lumino/dragdrop@1.6.1
    @lumino/domutils@1.2.1
    @lumino/disposable@1.4.1
    @lumino/default-theme@0.4.1
    @lumino/datastore@0.10.1
    @lumino/datagrid@0.9.0
    @lumino/coreutils@1.5.1
    @lumino/commands@1.11.1
    @lumino/collections@1.3.1
    @lumino/application@1.10.1
    @lumino/algorithm@1.3.1

- fix columnCount signature [#82](https://github.com/jupyterlab/lumino/pull/82) ([@mbektas](https://github.com/mbektas))
- unsubscribe from grid wheel events on editor dispose [#80](https://github.com/jupyterlab/lumino/pull/80) ([@mbektas](https://github.com/mbektas))
- chore(build): Bump Typescript to 3.9.2 [#75](https://github.com/jupyterlab/lumino/pull/75) ([@GordonSmith](https://github.com/GordonSmith))

## 2020-5-23

    @lumino/widgets@1.13.0-alpha.0
    @lumino/virtualdom@1.7.0-alpha.0
    @lumino/signaling@1.4.0-alpha.0
    @lumino/properties@1.2.0-alpha.0
    @lumino/polling@1.3.0-alpha.0
    @lumino/messaging@1.4.0-alpha.0
    @lumino/keyboard@1.2.0-alpha.0
    @lumino/example-dockpanel@0.3.0-alpha.0
    @lumino/example-dockpanel-iife@0.1.0-alpha.0
    @lumino/example-dockpanel-amd@0.1.0-alpha.0
    @lumino/example-datastore@0.3.0-alpha.0
    @lumino/example-datagrid@0.5.0-alpha.0
    @lumino/dragdrop@1.6.0-alpha.0
    @lumino/domutils@1.2.0-alpha.0
    @lumino/disposable@1.4.0-alpha.0
    @lumino/default-theme@0.4.0-alpha.0
    @lumino/datastore@0.10.0-alpha.0
    @lumino/datagrid@0.8.0-alpha.0
    @lumino/coreutils@1.5.0-alpha.0
    @lumino/commands@1.11.0-alpha.0
    @lumino/collections@1.3.0-alpha.0
    @lumino/application@1.10.0-alpha.0
    @lumino/algorithm@1.3.0-alpha.0

- Added type search to command pallet search input [#57](https://github.com/jupyterlab/lumino/pull/57) ([@ggbhat](https://github.com/ggbhat))
- feat(build): Add UMD support [#40](https://github.com/jupyterlab/lumino/pull/40) ([@GordonSmith](https://github.com/GordonSmith))

## 2020-5-12

    @lumino/widgets@1.12.2
    @lumino/signaling@1.3.6
    @lumino/polling@1.2.2
    @lumino/example-dockpanel@0.2.2
    @lumino/example-datastore@0.2.13
    @lumino/example-datagrid@0.4.2
    @lumino/dragdrop@1.5.3
    @lumino/disposable@1.3.6
    @lumino/default-theme@0.3.2
    @lumino/datastore@0.9.2
    @lumino/datagrid@0.7.2
    @lumino/commands@1.10.3
    @lumino/application@1.9.2

- Fix `disconnectAll` implementation. [#71](https://github.com/jupyterlab/lumino/pull/71) ([@AlbertHilb](https://github.com/AlbertHilb))

## 2020-5-7

    @lumino/widgets@1.12.1
    @lumino/polling@1.2.1
    @lumino/example-dockpanel@0.2.1
    @lumino/example-datastore@0.2.12
    @lumino/example-datagrid@0.4.1
    @lumino/dragdrop@1.5.2
    @lumino/default-theme@0.3.1
    @lumino/datastore@0.9.1
    @lumino/datagrid@0.7.1
    @lumino/coreutils@1.4.3
    @lumino/commands@1.10.2
    @lumino/application@1.9.1

- Tell bundlers to not package a crypto module for the browser. [#70](https://github.com/jupyterlab/lumino/pull/70) ([@jasongrout](https://github.com/jasongrout))
- Fix boolean logic when false is specified [#69](https://github.com/jupyterlab/lumino/pull/69) ([@nmichaud](https://github.com/nmichaud))
- Bump jquery from 3.4.1 to 3.5.0 [#68](https://github.com/jupyterlab/lumino/pull/68) ([@dependabot](https://github.com/dependabot))
- Fix namespacing for 'invalid' classname [#67](https://github.com/jupyterlab/lumino/pull/67) ([@nmichaud](https://github.com/nmichaud))

## 2020-4-24

    @lumino/widgets@1.12.0
    @lumino/polling@1.2.0
    @lumino/example-dockpanel@0.2.0
    @lumino/example-datastore@0.2.11
    @lumino/example-datagrid@0.4.0
    @lumino/default-theme@0.3.0
    @lumino/datagrid@0.7.0
    @lumino/application@1.9.0

- Fixes tabsMovable on DockPanel [#66](https://github.com/jupyterlab/lumino/pull/66) ([@nmichaud](https://github.com/nmichaud))
- Customize minimum row and column section sizes for datagrid [#65](https://github.com/jupyterlab/lumino/pull/65) ([@nmichaud](https://github.com/nmichaud))

## 2020-3-22

    @lumino/polling@1.1.0
    @lumino/example-datastore@0.2.10
    @lumino/example-datagrid@0.3.4
    @lumino/datastore@0.9.0
    @lumino/datagrid@0.6.0

## 2020-2-19

    @lumino/widgets@1.11.1
    @lumino/virtualdom@1.6.1
    @lumino/signaling@1.3.5
    @lumino/polling@1.0.4
    @lumino/example-dockpanel@0.1.31
    @lumino/example-datastore@0.2.9
    @lumino/example-datagrid@0.3.3
    @lumino/dragdrop@1.5.1
    @lumino/disposable@1.3.5
    @lumino/default-theme@0.2.4
    @lumino/datastore@0.8.4
    @lumino/datagrid@0.5.3
    @lumino/commands@1.10.1
    @lumino/application@1.8.4

- Yet another fix for vdom nodes with custom renderers [#53](https://github.com/jupyterlab/lumino/pull/53) ([@telamonian](https://github.com/telamonian))
- Fix names for poll tests. [#50](https://github.com/jupyterlab/lumino/pull/50) ([@afshin](https://github.com/afshin))
- Fix broken links in polling package and signaling tests. [#49](https://github.com/jupyterlab/lumino/pull/49) ([@afshin](https://github.com/afshin))

## 2020-2-10

    @lumino/widgets@1.11.0
    @lumino/virtualdom@1.6.0
    @lumino/example-dockpanel@0.1.30
    @lumino/example-datastore@0.2.8
    @lumino/example-datagrid@0.3.2
    @lumino/default-theme@0.2.3
    @lumino/datagrid@0.5.2
    @lumino/commands@1.10.0
    @lumino/application@1.8.3

- IRenderer cleanup; normalize icon fields across all interfaces [#46](https://github.com/jupyterlab/lumino/pull/46) ([@telamonian](https://github.com/telamonian))

## 2020-1-27

    @lumino/widgets@1.10.2
    @lumino/virtualdom@1.5.0
    @lumino/example-dockpanel@0.1.29
    @lumino/example-datastore@0.2.7
    @lumino/example-datagrid@0.3.1
    @lumino/default-theme@0.2.2
    @lumino/datagrid@0.5.1
    @lumino/application@1.8.2

- Simplified/improved custom rendering of virtual nodes: removed `hpass` and `VirtualElementPass`, added optional `renderer` param [#44](https://github.com/jupyterlab/lumino/pull/44) ([@telamonian](https://github.com/telamonian))

## 2020-1-24

    @lumino/widgets@1.10.1
    @lumino/virtualdom@1.4.1
    @lumino/example-dockpanel@0.1.28
    @lumino/example-datastore@0.2.6
    @lumino/example-datagrid@0.3.0
    @lumino/default-theme@0.2.1
    @lumino/datagrid@0.5.0
    @lumino/application@1.8.1

- Remove 'sourceMap' from tsconfig in `@lumino/virtualdom` [#41](https://github.com/jupyterlab/lumino/pull/41) ([@zemeolotu](https://github.com/zemeolotu))
- Start a change log [#38](https://github.com/jupyterlab/lumino/pull/38) ([@blink1073](https://github.com/blink1073))
- DataGrid Cell Editing [#14](https://github.com/jupyterlab/lumino/pull/14) ([@mbektas](https://github.com/mbektas))

## 2020-1-8

    @lumino/widgets@1.10.0
    @lumino/example-dockpanel@0.1.27
    @lumino/example-datastore@0.2.5
    @lumino/example-datagrid@0.2.6
    @lumino/dragdrop@1.5.0
    @lumino/default-theme@0.2.0
    @lumino/datagrid@0.4.0
    @lumino/commands@1.9.2
    @lumino/application@1.8.0

- Update selector, data attribute, and event namespaces. [#20](https://github.com/jupyterlab/lumino/pull/20) ([@afshin](https://github.com/afshin))

## 2020-1-2

    @lumino/widgets@1.9.7
    @lumino/virtualdom@1.4.0
    @lumino/signaling@1.3.4
    @lumino/properties@1.1.6
    @lumino/polling@1.0.3
    @lumino/messaging@1.3.3
    @lumino/keyboard@1.1.6
    @lumino/example-dockpanel@0.1.26
    @lumino/example-datastore@0.2.4
    @lumino/example-datagrid@0.2.5
    @lumino/dragdrop@1.4.4
    @lumino/domutils@1.1.7
    @lumino/disposable@1.3.4
    @lumino/default-theme@0.1.12
    @lumino/datastore@0.8.3
    @lumino/datagrid@0.3.5
    @lumino/coreutils@1.4.2
    @lumino/commands@1.9.1
    @lumino/collections@1.2.3
    @lumino/application@1.7.7
    @lumino/algorithm@1.2.3

- Improve handling of attributes for hpass virtualdom elements [#36](https://github.com/jupyterlab/lumino/pull/36) ([@telamonian](https://github.com/telamonian))
- Fix `output.path` for webpack 4 [#35](https://github.com/jupyterlab/lumino/pull/35) ([@telamonian](https://github.com/telamonian))

## 2019-12-19

    @lumino/widgets@1.9.6
    @lumino/example-dockpanel@0.1.25
    @lumino/example-datastore@0.2.3
    @lumino/example-datagrid@0.2.4
    @lumino/default-theme@0.1.11
    @lumino/datagrid@0.3.4
    @lumino/commands@1.9.0
    @lumino/application@1.7.6

- Allow commands to accept partial json objects [#32](https://github.com/jupyterlab/lumino/pull/32) ([@blink1073](https://github.com/blink1073))

## 2019-12-17

    @lumino/widgets@1.9.5
    @lumino/virtualdom@1.3.0
    @lumino/signaling@1.3.3
    @lumino/properties@1.1.5
    @lumino/polling@1.0.2
    @lumino/messaging@1.3.2
    @lumino/keyboard@1.1.5
    @lumino/example-dockpanel@0.1.24
    @lumino/example-datastore@0.2.2
    @lumino/example-datagrid@0.2.3
    @lumino/dragdrop@1.4.3
    @lumino/domutils@1.1.6
    @lumino/disposable@1.3.3
    @lumino/default-theme@0.1.10
    @lumino/datastore@0.8.2
    @lumino/datagrid@0.3.3
    @lumino/coreutils@1.4.1
    @lumino/commands@1.8.1
    @lumino/collections@1.2.2
    @lumino/application@1.7.5
    @lumino/algorithm@1.2.2

- Update dependencies [#31](https://github.com/jupyterlab/lumino/pull/31) ([@blink1073](https://github.com/blink1073))
- Use the standby value generated instead of ignoring it. [#30](https://github.com/jupyterlab/lumino/pull/30) ([@jasongrout](https://github.com/jasongrout))
- Adds a "pass thru" virtual element [#29](https://github.com/jupyterlab/lumino/pull/29) ([@telamonian](https://github.com/telamonian))
- Update API reports [#28](https://github.com/jupyterlab/lumino/pull/28) ([@vidartf](https://github.com/vidartf))
- chore(build): Bump typescript to version 3.6.4 [#27](https://github.com/jupyterlab/lumino/pull/27) ([@GordonSmith](https://github.com/GordonSmith))
- chore(build): Add missing package.json dependencies [#24](https://github.com/jupyterlab/lumino/pull/24) ([@GordonSmith](https://github.com/GordonSmith))
- Enable / disable runtime tab dragging in DockPanel [#23](https://github.com/jupyterlab/lumino/pull/23) ([@GordonSmith](https://github.com/GordonSmith))
