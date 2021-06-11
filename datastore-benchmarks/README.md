
# CRDT benchmarks

> A collection of reproducible benchmarks. *PRs are welcome.*

```sh
npm i && npm start
```

## Benchmarks

#### B1: No conflicts

Simulate two clients. One client modifies a text object and sends update messages to the other client. We measure the time to perform the task (`time`), the amount of data exchanged (`avgUpdateSize`), the size of the encoded document after the task is performed (`docSize`) and the time to parse the encoded document (`parseTime`).

#### B2: Two users producing conflicts

Simulate two clients. Both start with a synced text object containing 100 characters. Both clients modify the text object in a single transaction and then send their changes to the other client. We measure the time to sync concurrent changes into a single client (`time`), the size of the update messages (`updateSize`), the size of the encoded document after the task is performed (`docSize`) and the time to parse the encoded document (`parseTime`).

#### B3: Many conflicts

Simulate `√N` concurrent actions. We measure the time to perform the task
and sync all clients (`time`), the size of the update messages (`updateSize`),
the size of the encoded document after the task is performed (`docSize`), and
the time to parse the encoded document (`parseTime`). The logarithm of `N` was
chosen because `√N` concurrent actions may result in up to `√N^2 - 1`
conflicts (apply action 1: 0 conlict; apply action2: 1 conflict, apply action 2: 2 conflicts, ..).

### Results

Generated results with `Node.js v12.4.0` and a Thinkpad X1 Carbon with `Intel® Core™ i5-8250U CPU @ 1.60GHz × 8`.

** Preliminary benchmark results for [a RON-based CRDT](https://github.com/gritzko/ron) (written in C++) are posted [in this thread](https://github.com/dmonad/crdt-benchmarks/issues/3).

| N = 6000 | Yjs | automerge |
| :- | -: | -: |
|Bundle size                                                               |     45007 bytes |    251368 bytes |
|Bundle size (gzipped)                                                     |     13589 bytes |     59856 bytes |
|[B1.1] Append N characters (time)                                         |          155 ms |         3241 ms |
|[B1.1] Append N characters (avgUpdateSize)                                |        20 bytes |       326 bytes |
|[B1.1] Append N characters (docSize)                                      |      6018 bytes |   2161851 bytes |
|[B1.1] Append N characters (parseTime)                                    |            0 ms |          950 ms |
|[B1.2] Insert string of length N (time)                                   |            4 ms |         3374 ms |
|[B1.2] Insert string of length N (avgUpdateSize)                          |      6018 bytes |   1484719 bytes |
|[B1.2] Insert string of length N (docSize)                                |      6018 bytes |   1569051 bytes |
|[B1.2] Insert string of length N (parseTime)                              |            0 ms |          732 ms |
|[B1.3] Prepend N characters (time)                                        |          135 ms |        98837 ms |
|[B1.3] Prepend N characters (avgUpdateSize)                               |        20 bytes |       290 bytes |
|[B1.3] Prepend N characters (docSize)                                     |     59881 bytes |   1946994 bytes |
|[B1.3] Prepend N characters (parseTime)                                   |           11 ms |        96560 ms |
|[B1.4] Insert N characters at random positions (time)                     |          269 ms |         3974 ms |
|[B1.4] Insert N characters at random positions (avgUpdateSize)            |        27 bytes |       326 bytes |
|[B1.4] Insert N characters at random positions (docSize)                  |    100602 bytes |   2159192 bytes |
|[B1.4] Insert N characters at random positions (parseTime)                |            8 ms |         1291 ms |
|[B1.5] Insert N words at random positions (time)                          |          433 ms |        18079 ms |
|[B1.5] Insert N words at random positions (avgUpdateSize)                 |        33 bytes |      1587 bytes |
|[B1.5] Insert N words at random positions (docSize)                       |    204120 bytes |  10148335 bytes |
|[B1.5] Insert N words at random positions (parseTime)                     |           23 ms |         6894 ms |
|[B1.6] Insert string, then delete it (time)                               |            2 ms |         3071 ms |
|[B1.6] Insert string, then delete it (avgUpdateSize)                      |      6029 bytes |   1412719 bytes |
|[B1.6] Insert string, then delete it (docSize)                            |        27 bytes |   1497051 bytes |
|[B1.6] Insert string, then delete it (parseTime)                          |            0 ms |          369 ms |
|[B1.7] Insert/Delete strings at random positions (time)                   |          380 ms |        10523 ms |
|[B1.7] Insert/Delete strings at random positions (avgUpdateSize)          |        24 bytes |      1102 bytes |
|[B1.7] Insert/Delete strings at random positions (docSize)                |     91617 bytes |   7085598 bytes |
|[B1.7] Insert/Delete strings at random positions (parseTime)              |           15 ms |         4554 ms |
|[B1.8] Append N numbers (time)                                            |          273 ms |        25717 ms |
|[B1.8] Append N numbers (avgUpdateSize)                                   |        25 bytes |       333 bytes |
|[B1.8] Append N numbers (docSize)                                         |     35623 bytes |   2200659 bytes |
|[B1.8] Append N numbers (parseTime)                                       |            0 ms |          900 ms |
|[B1.9] Insert Array of N numbers (time)                                   |            2 ms |         3516 ms |
|[B1.9] Insert Array of N numbers (avgUpdateSize)                          |     35650 bytes |   1523693 bytes |
|[B1.9] Insert Array of N numbers (docSize)                                |     35650 bytes |   1608026 bytes |
|[B1.9] Insert Array of N numbers (parseTime)                              |            0 ms |          693 ms |
|[B1.10] Prepend N numbers (time)                                          |          105 ms |       115338 ms |
|[B1.10] Prepend N numbers (avgUpdateSize)                                 |        25 bytes |       297 bytes |
|[B1.10] Prepend N numbers (docSize)                                       |     89511 bytes |   1985894 bytes |
|[B1.10] Prepend N numbers (parseTime)                                     |            8 ms |        87201 ms |
|[B1.11] Insert N numbers at random positions (time)                       |          265 ms |        23861 ms |
|[B1.11] Insert N numbers at random positions (avgUpdateSize)              |        32 bytes |       332 bytes |
|[B1.11] Insert N numbers at random positions (docSize)                    |    130248 bytes |   2198120 bytes |
|[B1.11] Insert N numbers at random positions (parseTime)                  |           20 ms |         1351 ms |
|[B2.1] Cuncurrently insert string of length N at index 0 (time)           |            1 ms |         7442 ms |
|[B2.1] Cuncurrently insert string of length N at index 0 (updateSize)     |     12036 bytes |   2970726 bytes |
|[B2.1] Cuncurrently insert string of length N at index 0 (docSize)        |     12142 bytes |   3164619 bytes |
|[B2.1] Cuncurrently insert string of length N at index 0 (parseTime)      |            0 ms |         1759 ms |
|[B2.2] Cuncurrently insert N characters at random positions (time)        |          462 ms |        76536 ms |
|[B2.2] Cuncurrently insert N characters at random positions (updateSize)  |    189800 bytes |   2753229 bytes |
|[B2.2] Cuncurrently insert N characters at random positions (docSize)     |    190698 bytes |   2947122 bytes |
|[B2.2] Cuncurrently insert N characters at random positions (parseTime)   |           38 ms |        89256 ms |
|[B2.3] Cuncurrently insert N words at random positions (time)             |          883 ms |       381471 ms |
|[B2.3] Cuncurrently insert N words at random positions (updateSize)       |    405775 bytes |  17696052 bytes |
|[B2.3] Cuncurrently insert N words at random positions (docSize)          |    406553 bytes |  18725017 bytes |
|[B2.3] Cuncurrently insert N words at random positions (parseTime)        |           64 ms |       174570 ms |
|[B2.4] Cuncurrently insert & delete (time)                                |         2721 ms |       613474 ms |
|[B2.4] Cuncurrently insert & delete (updateSize)                          |    620776 bytes |  26580311 bytes |
|[B2.4] Cuncurrently insert & delete (docSize)                             |    621449 bytes |  28112800 bytes |
|[B2.4] Cuncurrently insert & delete (parseTime)                           |          117 ms |        21369 ms |
|[B3.1] √N clients concurrently set number in Map (time)                   |           20 ms |           48 ms |
|[B3.1] √N clients concurrently set number in Map (updateSize)             |      1548 bytes |     12233 bytes |
|[B3.1] √N clients concurrently set number in Map (docSize)                |      1834 bytes |     14324 bytes |
|[B3.1] √N clients concurrently set number in Map (parseTime)              |            3 ms |           42 ms |
|[B3.2] √N clients concurrently set Object in Map (time)                   |           13 ms |           73 ms |
|[B3.2] √N clients concurrently set Object in Map (updateSize)             |      4518 bytes |     34101 bytes |
|[B3.2] √N clients concurrently set Object in Map (docSize)                |      2025 bytes |     37809 bytes |
|[B3.2] √N clients concurrently set Object in Map (parseTime)              |            2 ms |           42 ms |
|[B3.3] √N clients concurrently set String in Map (time)                   |            4 ms |           43 ms |
|[B3.3] √N clients concurrently set String in Map (updateSize)             |     12688 bytes |     23331 bytes |
|[B3.3] √N clients concurrently set String in Map (docSize)                |      1985 bytes |     25422 bytes |
|[B3.3] √N clients concurrently set String in Map (parseTime)              |            1 ms |           28 ms |
|[B3.4] √N clients concurrently insert text in Array (time)                |            9 ms |           40 ms |
|[B3.4] √N clients concurrently insert text in Array (updateSize)          |      1681 bytes |     24821 bytes |
|[B3.4] √N clients concurrently insert text in Array (docSize)             |      1529 bytes |     27752 bytes |
|[B3.4] √N clients concurrently insert text in Array (parseTime)           |            2 ms |           89 ms |

## Development

Modify the `N` variable in `benchmarks/utils.js` to increase the difficulty.

```sh
npm run watch
node dist/benchmark.js
```

Now you can also open `benchmark.html` to run the benchmarks in the browser.

## License

[The MIT License](./LICENSE) © Kevin Jahns
