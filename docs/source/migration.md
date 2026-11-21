# Migration guide for Lumino 1 to Lumino 2

## Iterables, iterators, and generators

### Overview and suggestions on iteration

These are some guiding principles that came up over the course of refactoring the way we handle iteration in Lumino. They are not hard and fast rules, rather they are intuitions that arose while implementing the changes Lumino 2.

### Iterate natively instead of using `each(...)`

Iterating through an iterable `bar: Iterable<T>` using native `for...of`, e.g., `for (const foo of bar) {...}` is a better option than using `each(bar, foo => ...)`.

All invocations of `each(...)` have been removed in Lumino 2. See, for example, [this commit](https://github.com/jupyterlab/lumino/pull/346/commits/efb1e919bb359192caeedb726e16ec42d17b3b0f).

### Use `[].forEach(...)` sparingly

Now that we support native ES2018 iteration, `for (const value of someArray) {...}` should be favored over `someArray.forEach(...)` because it will not require a context shift every time it invokes the function being applied.

### Use `[Symbol.iterator]()` sparingly

Unless you need a handle on multiple iterators simultaneously (e.g., the way `zip(...)` is implemented in Lumino 2) or you need to hold on to multiple values of your iterable during iteration (e.g., the way we need both the first and the second value of an iterable to implement `reduce(...)` in Lumino 2), most of the time you can simply use `for...of` to iterate through any object that has a `Symbol.iterator` method without invoking that method.

In many places where the Lumino `iter()` utility function has been replaced in Lumino 2 it is not replaced with an invocation of the new `Symbol.iterator` method.

### Consider `yield*` usage carefully

If you have a method or function that returns an iterator, you might simply return values using the `yield` keyword. If you are returning the contents of another iterable, you can use `yield*`. However, if your logic depends on some predicate, remember that the predicate is checked _when you iterate_ if you use `yield*`. For example, consider the following:

```typescript
const source = [1, 2, 3, 4, 5];
let flagged = false;

function* counter(): IterableIterator {
  if (!flagged) {
    yield* source;
  }
}

// This is how a client would use the `counter()` function.
const iterable = counter();
flagged = true;
console.log(Array.from(iterable)); // []
```

Instead, if we modify the code:

```typescript
import { empty } from '@lumino/algorithm';

const source = [1, 2, 3, 4, 5];
let flagged = false;

function counter(): IterableIterator<number> {
  if (!flagged) {
    return source[Symbol.iterator]();
  }
  return empty();
}

// This is how a client would use the `counter()` function.
const iterable = counter();
flagged = true;
console.log(Array.from(iterable)); // [1, 2, 3, 4. 5]
```

In these two examples, the client code that consumes `counter()` is identical. But the results are different. Both implementations are _correct_, but depending on your use case, one may be more appropriate than the other. The important thing to consider is that the two implementations are _not_ identical and yield different results.

### Use `Array.from(...)` sparingly

`toArray(...)` has been deprecated. You may be tempted to swap in `Array.from(...)` when you update your code. This _will_ work, but if you simply need to iterate through an iterable, you can use `for...of` directly on the iterable object. This is more performant both in terms of CPU and memory than allocating and populating new `Array` instance before iteration.

If you need a snapshot of every item in your iterable as an array, then `Array.from(...)` is an appropriate replacement for `toArray(...)`.

### Look out for `iterator.next() !== undefined`

This pattern may appear in your code if you were using Lumino 1 iterators. Instead of checking `iterator.next().done`, as is the case with native iterators, Lumino 1 iterators set `next()` to the value `undefined` as an optimization to prevent allocating an object with `.value` and `.done`, so when migrating from Lumino 1 to Lumino 2, this is a common cause of confusion. For example, a `while` loop in Lumino 1 may have had this predicate:

```typescript
while ((it = it.next()) !== undefined) {
  // loop logic
}
```

The native (Lumino 2) version of this loop would be:

```typescript
while (!(it = it.next()).done) {
  // loop logic
}
```

### Replace `widget.node` with `widget.attachmentNode`

Lumino 2 distinguishes between the contents node (`node`) and attachment node
(`attachmentNode`) of widgets to enable attaching widgets via shadow DOM root.
By default attachment and contents node are the same, but for widgets with
shadow DOM enabled, they differ. Downstream layouts need to update methods
attaching and detaching widgets to use attachment node if they want to support
moving the widgets to shadow DOM.

## Public API changes

### `@lumino/algorithm`

All of the iterator utilities have been changed to use native generators and iterators.

|     | `export`    | name                     | note                                                                                                                                                                                                                                                                                                                                         |
| --- | ----------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ❌  | `type`      | `IterableOrArrayLike<T>` | Switch to [`Iterable<T>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol)                                                                                                                                                                                                       |
| ❌  | `interface` | `IIterable<T>`           | Switch to `Iterable<T>`                                                                                                                                                                                                                                                                                                                      |
| ❌  | `interface` | `IIterator<T>`           | Switch to [`Iterator<T>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterator_protocol) / `IterableIterator<T>`                                                                                                                                                                               |
| ❌  | `function`  | `iter<T>(...)`           | Switch to [`Symbol.iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator), [`function*`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*), [`yield*`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield*), etc. |
| ❌  | `function`  | `iterFn<T>(...)`         | Switch to `function*`                                                                                                                                                                                                                                                                                                                        |
| ❌  | `function`  | `iterItems<T>(...)`      | We aren't using this function anywhere                                                                                                                                                                                                                                                                                                       |
| ❌  | `function`  | `iterKeys<T>(...)`       | Switch to [`for...in`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in)                                                                                                                                                                                                                                |
| ❌  | `function`  | `iterValues<T>(...)`     | Switch to [`for...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of)                                                                                                                                                                                                                                |
| ❌  | `class`     | `ArrayIterator<T>`       | Switch to `[][Symbol.iterator]()` or `yield*`                                                                                                                                                                                                                                                                                                |
| ❌  | `class`     | `ChainIterator<T>`       | Previous implementation of `chain<T>()`                                                                                                                                                                                                                                                                                                      |
| ❌  | `class`     | `EmptyIterator<T>`       | Previous implementation of `empty<T>()`                                                                                                                                                                                                                                                                                                      |
| ❌  | `class`     | `EnumerateIterator<T>`   | Previous implementation of `enumerate<T>()`                                                                                                                                                                                                                                                                                                  |
| ❌  | `class`     | `FilterIterator<T>`      | Previous implementation of `filter<T>()`                                                                                                                                                                                                                                                                                                     |
| ❌  | `class`     | `FnIterator<T>`          | Switch to [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator)                                                                                                                                                                                                                           |
| ❌  | `class`     | `ItemIterator<T>`        | We aren't using this class anywhere                                                                                                                                                                                                                                                                                                          |
| ❌  | `class`     | `KeyIterator`            | Switch to `for...in`                                                                                                                                                                                                                                                                                                                         |
| ❌  | `class`     | `MapIterator<T>`         | Previous implementation of `map<T>()`                                                                                                                                                                                                                                                                                                        |
| ❌  | `class`     | `RangeIterator<T>`       | Previous implementation of `range()`                                                                                                                                                                                                                                                                                                         |
| ❌  | `class`     | `RetroIterator<T>`       | Previous implementation of `retro<T>()`                                                                                                                                                                                                                                                                                                      |
| ❌  | `class`     | `StrideIterator<T>`      | Previous implementation of `stride<T>()`                                                                                                                                                                                                                                                                                                     |
| ❌  | `class`     | `TakeIterator<T>`        | Previous implementation of `take<T>()`                                                                                                                                                                                                                                                                                                       |
| ❌  | `class`     | `ValueIterator<T>`       | Switch to `for...of`                                                                                                                                                                                                                                                                                                                         |
| ❌  | `class`     | `ZipIterator<T>`         | Previous implementation of `zip<T>()`                                                                                                                                                                                                                                                                                                        |
| ☑️  | `function`  | `chain<T>(...)`          | `@deprecated`, use native [`yield`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield) instead                                                                                                                                                                                                               |
| ☑️  | `function`  | `each<T>(...)`           | `@deprecated`, use native `for...of`, `[].forEach`, etc.                                                                                                                                                                                                                                                                                     |
| ✅  | `function`  | `empty<T>(...)`          | Reimplement with native types                                                                                                                                                                                                                                                                                                                |
| ✅  | `function`  | `enumerate<T>(...)`      | Reimplement with native types                                                                                                                                                                                                                                                                                                                |
| ✅  | `function`  | `every<T>(...)`          | Reimplement with native types                                                                                                                                                                                                                                                                                                                |
| ✅  | `function`  | `filter<T>(...)`         | Reimplement with native types                                                                                                                                                                                                                                                                                                                |
| ✅  | `function`  | `find<T>(...)`           | Reimplement with native types                                                                                                                                                                                                                                                                                                                |
| ✅  | `function`  | `findIndex<T>(...)`      | Reimplement with native types                                                                                                                                                                                                                                                                                                                |
| ✅  | `function`  | `map<T>(...)`            | Reimplement with native types                                                                                                                                                                                                                                                                                                                |
| ✅  | `function`  | `max<T>(...)`            | Reimplement with native types                                                                                                                                                                                                                                                                                                                |
| ✅  | `function`  | `min<T>(...)`            | Reimplement with native types                                                                                                                                                                                                                                                                                                                |
| ✅  | `function`  | `minmax<T>(...)`         | Support native types                                                                                                                                                                                                                                                                                                                         |
| ☑️  | `function`  | `once<T>(...)`           | `@deprecated`, use native `yield` instead                                                                                                                                                                                                                                                                                                    |
| ✅  | `function`  | `reduce<T>(...)`         | Support native types                                                                                                                                                                                                                                                                                                                         |
| ✅  | `function`  | `range(...)`             | Reimplement with native types                                                                                                                                                                                                                                                                                                                |
| ☑️  | `function`  | `repeat<T>(...)`         | `deprecated`, use native `while` loop with `yield`                                                                                                                                                                                                                                                                                           |
| ✅  | `function`  | `retro<T>(...)`          | Reimplement with native types                                                                                                                                                                                                                                                                                                                |
| ✅  | `function`  | `some<T>(...)`           | Reimplement with native types                                                                                                                                                                                                                                                                                                                |
| ✅  | `function`  | `stride<T>(...)`         | Reimplement with native types                                                                                                                                                                                                                                                                                                                |
| ✅  | `function`  | `take<T>(...)`           | Reimplement with native types                                                                                                                                                                                                                                                                                                                |
| ☑️  | `function`  | `toArray<T>(...)`        | `@deprecated`, use [`Array.from(...)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from) or [`for...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of)                                                                                                   |
| ✅  | `function`  | `toObject(...)`          | Reimplement with native types                                                                                                                                                                                                                                                                                                                |
| ✅  | `function`  | `topologicSort<T>(...)`  | Support native types                                                                                                                                                                                                                                                                                                                         |
| ✅  | `function`  | `zip<T>(...)`            | Reimplement with native types                                                                                                                                                                                                                                                                                                                |

### `@lumino/collections`

`LinkedList` has been updated to accept native iterables and return native iterators.

|     | `export`   | name                              | note                                                 |
| --- | ---------- | --------------------------------- | ---------------------------------------------------- |
| ❌  | `class`    | `LinkedList.ForwardValueIterator` | Switch to `LinkedList#[Symbol.iterator]`             |
| ❌  | `class`    | `LinkedList.RetroValueIterator`   | Previous implementation of `LinkedList#retro()`      |
| ❌  | `class`    | `LinkedList.ForwardNodeIterator`  | Previous implementation of `LinkedList#nodes()`      |
| ❌  | `class`    | `LinkedList.RetroNodeIterator`    | Previous implementation of `LinkedList#retroNodes()` |
| ❌  | `method`   | `LinkedList#iter()`               | Switch to `LinkedList#[Symbol.iterator]`             |
| ✅  | `function` | `LinkedList.from<T>(...)`         | Accept `Iterable<T>`                                 |
| ✅  | `method`   | `LinkedList#assign(...)`          | Accept `Iterable<T>`                                 |
| ✅  | `method`   | `LinkedList#nodes()`              | Return `IterableIterator<LinkedList.INode<T>>`       |
| ✅  | `method`   | `LinkedList#retro()`              | Return `IterableIterator<T>`                         |
| ✅  | `method`   | `LinkedList#retroNodes()`         | Return `IterableIterator<LinkedList.INode<T>>`       |

### `@lumino/datagrid`

`DataGrid` selections are now native iterators.

|     | `export` | name                               | note                                                |
| --- | -------- | ---------------------------------- | --------------------------------------------------- |
| ✅  | `method` | `BasicSelectionModel#selections()` | Return `IterableIterator<SelectionModel.Selection>` |
| ✅  | `method` | `SelectionModel#selections()`      | Return `IterableIterator<SelectionModel.Selection>` |

### `@lumino/disposable`

Helper functions for `DisposableSet` and `ObservableDisposableSet` have been udpated.

|     | `export`   | name                                | note                           |
| --- | ---------- | ----------------------------------- | ------------------------------ |
| ✅  | `function` | `DisposableSet.from(...)`           | Accept `Iterable<IDisposable>` |
| ✅  | `function` | `ObservableDisposableSet.from(...)` | Accept `Iterable<IDisposable>` |

### `@lumino/dragdrop`

|     | `export`    | name               | note                                    |
| --- | ----------- | ------------------ | --------------------------------------- |
| ❌  | `type`      | `DropAction`       | Moved to `Drag.DropAction`              |
| ❌  | `type`      | `SupportedActions` | Moved to `Drag.SupportedActions`        |
| ☑️  | `interface` | `IDragEvent`       | `@deprecated`, use `Drag.Event` instead |

### `@lumino/widgets`

`Layout` and its sub-classes now use native iterators, e.g. `implements Iterable<Widget>`.

|     | `export` | name                           | note                                          |
| --- | -------- | ------------------------------ | --------------------------------------------- |
| ❌  | `method` | `DockLayout#iter()`            | Switch to `DockLayout#[Symbol.iterator]`      |
| ❌  | `method` | `GridLayout#iter()`            | Switch to `GridLayout#[Symbol.iterator]`      |
| ❌  | `method` | `Layout#iter()`                | Switch to `Layout#[Symbol.iterator]`          |
| ❌  | `method` | `PanelLayout#iter()`           | Switch to `PanelLayout#[Symbol.iterator]`     |
| ❌  | `method` | `SingletonLayout#iter()`       | Switch to `SingletonLayout#[Symbol.iterator]` |
| ✅  | `method` | `DockLayout#handles()`         | Return `IterableIterator<HTMLDivElement>`     |
| ✅  | `method` | `DockLayout#selectedWidgets()` | Return `IterableIterator<Widget>`             |
| ✅  | `method` | `DockLayout#tabBars()`         | Return `IterableIterator<TabBar<Widget>>`     |
| ✅  | `method` | `DockLayout#widgets()`         | Return `IterableIterator<Widget>`             |
| ✅  | `method` | `DockPanel#handles()`          | Return `IterableIterator<HTMLDivElement>`     |
| ✅  | `method` | `DockPanel#selectedWidgets()`  | Return `IterableIterator<Widget>`             |
| ✅  | `method` | `DockPanel#tabBars()`          | Return `IterableIterator<TabBar<Widget>>`     |
| ✅  | `method` | `DockPanel#widgets()`          | Return `IterableIterator<Widget>`             |
| ✅  | `method` | `Widget#children()`            | Return `IterableIterator<Widget>`             |
