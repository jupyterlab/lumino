# example-dockpanel-amd

_AMD_ version of [example-dockpanel](../example-dockpanel)

## Prerequisites

From the root lumino folder run:

```
yarn install
yarn run build
yarn run minimize
```

You should now be able to open [index.html](./index.html) directly into your web browser.

## Notable differences

- All dependencies loaded via AMD + RequireJS, see `head` section of [index.html](./index.html)
- TypeScript converted to IE compatible JavaScript
- CSS files manually imported as needed via [style/index.css](style/index.css)
