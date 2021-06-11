# Results

The following results were obtained on a 2019 MacBook Pro with a 2.8 GHz Intel Core i7 and 16 GB of 2133 MHz RAM.

| N = 5000 | Yjs | lumino | automerge |
| :- | -: | -: | -: |
|Bundle size                                                               |     49190 bytes |                 |    251368 bytes |
|Bundle size (gzipped)                                                     |     15014 bytes |                 |     59902 bytes |
|[B1.1] Append N characters (time)                                         |          154 ms |           93 ms |         2037 ms |
|[B1.1] Append N characters (avgUpdateSize)                                |        20 bytes |        44 bytes |       326 bytes |
|[B1.1] Append N characters (docSize)                                      |      5018 bytes |    220000 bytes |   1800851 bytes |
|[B1.1] Append N characters (parseTime)                                    |            0 ms |           15 ms |          679 ms |
|[B1.2] Insert string of length N (time)                                   |            0 ms |           13 ms |         2053 ms |
|[B1.2] Insert string of length N (avgUpdateSize)                          |      5018 bytes |     90026 bytes |   1236719 bytes |
|[B1.2] Insert string of length N (docSize)                                |      5018 bytes |     90026 bytes |   1307051 bytes |
|[B1.2] Insert string of length N (parseTime)                              |            0 ms |            7 ms |          400 ms |
|[B1.3] Prepend N characters (time)                                        |          103 ms |          710 ms |        46195 ms |
|[B1.3] Prepend N characters (avgUpdateSize)                               |        20 bytes |      7896 bytes |       290 bytes |
|[B1.3] Prepend N characters (docSize)                                     |     49881 bytes |  39481392 bytes |   1621994 bytes |
|[B1.3] Prepend N characters (parseTime)                                   |           24 ms |          239 ms |        39933 ms |
|[B1.4] Insert N characters at random positions (time)                     |          172 ms |           63 ms |         2302 ms |
|[B1.4] Insert N characters at random positions (avgUpdateSize)            |        27 bytes |        59 bytes |       326 bytes |
|[B1.4] Insert N characters at random positions (docSize)                  |     83706 bytes |    296400 bytes |   1798598 bytes |
|[B1.4] Insert N characters at random positions (parseTime)                |           11 ms |           17 ms |          942 ms |
|[B1.5] Insert N words at random positions (time)                          |          202 ms |          266 ms |        11667 ms |
|[B1.5] Insert N words at random positions (avgUpdateSize)                 |        33 bytes |       307 bytes |      1590 bytes |
|[B1.5] Insert N words at random positions (docSize)                       |    168806 bytes |   1535542 bytes |   8472644 bytes |
|[B1.5] Insert N words at random positions (parseTime)                     |           19 ms |           91 ms |         4110 ms |
|[B1.6] Insert string, then delete it (time)                               |            1 ms |            5 ms |         1672 ms |
|[B1.6] Insert string, then delete it (avgUpdateSize)                      |      5029 bytes |    180026 bytes |   1176719 bytes |
|[B1.6] Insert string, then delete it (docSize)                            |        27 bytes |    180026 bytes |   1247051 bytes |
|[B1.6] Insert string, then delete it (parseTime)                          |            0 ms |            2 ms |          191 ms |
|[B1.7] Insert/Delete strings at random positions (time)                   |          203 ms |           90 ms |         6873 ms |
|[B1.7] Insert/Delete strings at random positions (avgUpdateSize)          |        23 bytes |       393 bytes |      1093 bytes |
|[B1.7] Insert/Delete strings at random positions (docSize)                |     78132 bytes |   1965386 bytes |   5859310 bytes |
|[B1.7] Insert/Delete strings at random positions (parseTime)              |           11 ms |           30 ms |         2363 ms |
|[B1.8] Append N numbers (time)                                            |          131 ms |          226 ms |        12685 ms |
|[B1.8] Append N numbers (avgUpdateSize)                                   |        25 bytes |        50 bytes |       333 bytes |
|[B1.8] Append N numbers (docSize)                                         |     29702 bytes |    250000 bytes |   1833278 bytes |
|[B1.8] Append N numbers (parseTime)                                       |            0 ms |           95 ms |          673 ms |
|[B1.9] Insert Array of N numbers (time)                                   |            2 ms |            3 ms |         2505 ms |
|[B1.9] Insert Array of N numbers (avgUpdateSize)                          |     29742 bytes |    120026 bytes |   1269182 bytes |
|[B1.9] Insert Array of N numbers (docSize)                                |     29742 bytes |    120026 bytes |   1339515 bytes |
|[B1.9] Insert Array of N numbers (parseTime)                              |            0 ms |            3 ms |          424 ms |
|[B1.10] Prepend N numbers (time)                                          |           59 ms |          798 ms |        64780 ms |
|[B1.10] Prepend N numbers (avgUpdateSize)                                 |        25 bytes |      7914 bytes |       297 bytes |
|[B1.10] Prepend N numbers (docSize)                                       |     74527 bytes |  39569168 bytes |   1654372 bytes |
|[B1.10] Prepend N numbers (parseTime)                                     |            3 ms |          313 ms |        40845 ms |
|[B1.11] Insert N numbers at random positions (time)                       |          130 ms |          195 ms |        12593 ms |
|[B1.11] Insert N numbers at random positions (avgUpdateSize)              |        32 bytes |        67 bytes |       332 bytes |
|[B1.11] Insert N numbers at random positions (docSize)                    |    108311 bytes |    333760 bytes |   1830954 bytes |
|[B1.11] Insert N numbers at random positions (parseTime)                  |            7 ms |           78 ms |          705 ms |
|[B2.1] Concurrently insert string of length N at index 0 (time)           |            0 ms |           30 ms |         4355 ms |
|[B2.1] Concurrently insert string of length N at index 0 (updateSize)     |     10036 bytes |    180052 bytes |   2474726 bytes |
|[B2.1] Concurrently insert string of length N at index 0 (docSize)        |     10142 bytes |     91852 bytes |   2640619 bytes |
|[B2.1] Concurrently insert string of length N at index 0 (parseTime)      |            0 ms |            4 ms |         1035 ms |
|[B2.2] Concurrently insert N characters at random positions (time)        |          252 ms |          315 ms |        33618 ms |
|[B2.2] Concurrently insert N characters at random positions (updateSize)  |    156427 bytes |    250132 bytes |   2293529 bytes |
|[B2.2] Concurrently insert N characters at random positions (docSize)     |    157226 bytes |    125964 bytes |   2459422 bytes |
|[B2.2] Concurrently insert N characters at random positions (parseTime)   |           31 ms |           16 ms |        39142 ms |
|[B2.3] Concurrently insert N words at random positions (time)             |          434 ms |          878 ms |       161925 ms |
|[B2.3] Concurrently insert N words at random positions (updateSize)       |    335255 bytes |   2085812 bytes |  14726110 bytes |
|[B2.3] Concurrently insert N words at random positions (docSize)          |    336033 bytes |   1043164 bytes |  15587341 bytes |
|[B2.3] Concurrently insert N words at random positions (parseTime)        |           51 ms |           89 ms |        69346 ms |
|[B2.4] Concurrently insert & delete (time)                                |         1118 ms |         2312 ms |       284805 ms |
|[B2.4] Concurrently insert & delete (updateSize)                          |    514510 bytes |   5428208 bytes |  22188575 bytes |
|[B2.4] Concurrently insert & delete (docSize)                             |    515176 bytes |   2866998 bytes |  23472634 bytes |
|[B2.4] Concurrently insert & delete (parseTime)                           |           80 ms |          182 ms |        13074 ms |
|[B3.1] √N clients concurrently set number in Map (time)                   |            7 ms |            3 ms |           20 ms |
|[B3.1] √N clients concurrently set number in Map (updateSize)             |      1402 bytes |      3080 bytes |     11120 bytes |
|[B3.1] √N clients concurrently set number in Map (docSize)                |      1668 bytes |        44 bytes |     13022 bytes |
|[B3.1] √N clients concurrently set number in Map (parseTime)              |            1 ms |            0 ms |           15 ms |
|[B3.2] √N clients concurrently set Object in Map (time)                   |            7 ms |            1 ms |           34 ms |
|[B3.2] √N clients concurrently set Object in Map (updateSize)             |      4111 bytes |      3340 bytes |     31000 bytes |
|[B3.2] √N clients concurrently set Object in Map (docSize)                |      1846 bytes |        46 bytes |     34372 bytes |
|[B3.2] √N clients concurrently set Object in Map (parseTime)              |            1 ms |            0 ms |           18 ms |
|[B3.3] √N clients concurrently set String in Map (time)                   |            3 ms |            1 ms |           17 ms |
|[B3.3] √N clients concurrently set String in Map (updateSize)             |     10554 bytes |     20720 bytes |     20230 bytes |
|[B3.3] √N clients concurrently set String in Map (docSize)                |      1805 bytes |       176 bytes |     22132 bytes |
|[B3.3] √N clients concurrently set String in Map (parseTime)              |            1 ms |            0 ms |           16 ms |
|[B3.4] √N clients concurrently insert text in Array (time)                |            2 ms |            1 ms |           23 ms |
|[B3.4] √N clients concurrently insert text in Array (updateSize)          |      1525 bytes |      3200 bytes |     22560 bytes |
|[B3.4] √N clients concurrently insert text in Array (docSize)             |      1387 bytes |        44 bytes |     25253 bytes |
|[B3.4] √N clients concurrently insert text in Array (parseTime)           |            1 ms |            0 ms |           31 ms |