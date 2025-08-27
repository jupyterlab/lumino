# @lumino/polling

This package provides a class for generic polling functionality (`Poll`). It
also provides rate limiters (`Debouncer` and `Throttler`).

The `Poll` class provides three different ways to "subscribe" to poll ticks:

- [`@lumino/signaling`](../signaling/): `Poll#ticked` is a Lumino signal that
  emits each time there is a poll tick.
- `Promise`-based: `Poll#tick` is a promise that resolves after every tick and
  only rejects when the poll is disposed.
- `AsyncIterable`: `Poll#[`Symbol.asyncIterator`]` implements the async iterable
  protocol that allows iteration using [`for-await...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) loops.

## Example usage

These are examples from the unit tests for this package. They
demonstrate the three different ways polling is supported.

### Using `Poll#tick` promise

Here, we set up the testing state variables and create a new `Poll` instance.

```typescript
const expected = 'started resolved resolved';
const ticker: IPoll.Phase<any>[] = [];
const tock = (poll: Poll) => {
  ticker.push(poll.state.phase);
  poll.tick.then(tock).catch(() => undefined);
};
const poll = new Poll({
  auto: false,
  factory: () => Promise.resolve(),
  frequency: { interval: 100, backoff: false }
});
```

Next we assign the `tock` function to run after the poll ticks and
we start the poll.

```typescript
void poll.tick.then(tock);
void poll.start();
```

And we verify that the `ticker` did indeed get populated when `tock`
was called and the next promise was captured as well.

```typescript
await sleep(1000); // Sleep for longer than the interval.
expect(ticker.join(' ').startsWith(expected)).to.equal(true);
poll.dispose();
```

### Using `Poll#ticked` signal

Here, we set up the testing state variables and create a new `Poll` instance.

```typescript
const poll = new Poll<void, void>({
  factory: () => Promise.resolve(),
  frequency: { interval: 100, backoff: false }
});
```

Here we connect to the `ticked` signal and simply check that each
tick matches the poll `state` accessor's contents.

```typescript
poll.ticked.connect((_, tick) => {
  expect(tick).to.equal(poll.state);
});
await sleep(1000); // Sleep for longer than the interval.
poll.dispose();
```

### Using `Poll` as an `AsyncIterable`

Here, we set up the testing state variables and create a new `Poll` instance.

```typescript
let poll: Poll;
let total = 2;
let i = 0;

poll = new Poll({
  auto: false,
  factory: () => Promise.resolve(++i > total ? poll.dispose() : void 0),
  frequency: { interval: Poll.IMMEDIATE }
});

const expected = `started${' resolved'.repeat(total)}`;
const ticker: IPoll.Phase<any>[] = [];
```

Then the poll is started:

```typescript
void poll.start();
```

Instead of connecting to the `ticked` signal or awaiting the `tick` promise, we can now use a `for-await...of` loop:

```typescript
for await (const state of poll) {
  ticker.push(state.phase);
  if (poll.isDisposed) {
    break;
  }
}
```

And we check to make sure the results are as expected:

```typescript
// ticker and expected both equal:
// 'started resolved resolved disposed'
expect(ticker.join(' ')).to.equal(expected);
```

### Note for consumers of async iterators

In order to use `for-await...of` loops in TypeScript, you will need to use `ES2018` or above in your `lib` array in `tsconfig.json`.
