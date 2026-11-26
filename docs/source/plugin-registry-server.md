# Running the plugin registry on the server

Lumino's [`PluginRegistry`](https://github.com/jupyterlab/lumino/blob/main/packages/coreutils/src/plugins.ts), the plugin system behind JupyterLab, lives in `@lumino/coreutils` and has no DOM dependency, so it runs in Node as-is. You don't need `@lumino/application` or `@lumino/widgets` to use it.

The `example-plugin-registry-server` example (in the repo's `examples/` directory) shows this with two plugins that the registry wires together through a shared service token, without importing each other:

- `hello` _provides_ an `IGreeting` service.
- `greeter` _requires_ `IGreeting` and uses it.

## The shared token

A `Token` identifies the service. The provider and the consumer both refer to this token; neither imports the other.

```{literalinclude} ../../examples/example-plugin-registry-server/src/tokens.ts
:language: typescript
:start-after: Modified BSD License.
```

## Providing and requiring a service

The `hello` plugin lists the token in `provides` and returns the service from `activate`:

```{literalinclude} ../../examples/example-plugin-registry-server/src/hello.ts
:language: typescript
:start-after: Modified BSD License.
```

The `greeter` plugin lists the token in `requires`; the registry passes the resolved service as an argument to `activate`:

```{literalinclude} ../../examples/example-plugin-registry-server/src/greeter.ts
:language: typescript
:start-after: Modified BSD License.
```

## Running it

Register the plugins and activate them:

```{literalinclude} ../../examples/example-plugin-registry-server/src/index.ts
:language: typescript
:start-after: Modified BSD License.
```

From the root of the repository, build the packages and then the example:

```bash
yarn install
yarn run build
yarn workspace @lumino/example-plugin-registry-server build
yarn workspace @lumino/example-plugin-registry-server start
```

```text
[hello] providing IGreeting
[greeter] Hello! (from the hello plugin)
```

The `[greeter]` line is produced by the consumer plugin calling the service the provider returned. The two are connected only through the shared `IGreeting` token, never by importing each other.
