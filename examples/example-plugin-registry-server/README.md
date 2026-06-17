# example-plugin-registry-server

Run the Lumino [`PluginRegistry`](../../packages/coreutils/src/plugins.ts), the
plugin system behind JupyterLab, on the server with Node.

`PluginRegistry` lives in `@lumino/coreutils` and has no DOM dependency, so it
runs in Node as-is: `@lumino/application` and `@lumino/widgets` are not needed.

Two plugins are wired together by the registry through a shared service token,
without importing each other:

- [`hello`](src/hello.ts) _provides_ an `IGreeting` service.
- [`greeter`](src/greeter.ts) _requires_ `IGreeting` and uses it.

## Prerequisites

From the root lumino folder, build the packages this example depends on:

```bash
yarn install
yarn run build
```

## Usage

```bash
yarn workspace @lumino/example-plugin-registry-server build
yarn workspace @lumino/example-plugin-registry-server start
```

```text
[hello] providing IGreeting
[greeter] Hello! (from the hello plugin)
```

The `[greeter]` line is produced by the consumer plugin calling the service the
provider plugin returned. The two are connected only through the shared
`IGreeting` token, never by importing each other.
