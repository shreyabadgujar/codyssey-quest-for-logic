# Hard mission expansion

Levels 6–8 extend nine islands. Array Archipelago keeps its 15 cases. The table shows the intended reference algorithms and auxiliary space. Input and output storage is excluded where the editorial says so.

| Island | Level and mission | Concept and algorithm | Time | Space |
| --- | --- | --- | --- | --- |
| Linked Isles | 6 · The Broken Convoy Refit | Signed blocks · relink each block and prepend it | O(n) | O(n) link table |
| Linked Isles | 7 · The Two Lantern Trails | Cyclic successor chains · first-visit distance tables and tie breaking | O(n) | O(n) |
| Linked Isles | 8 · The Uncut Causeway | Historical list queries · bucket by removal time and splice links | O(n+r+q) | O(n+r+q) |
| Stack & Queue Depths | 6 · The Sunken Drydock | Variable-width histogram · increasing stack with left boundaries | O(n) | O(n) |
| Stack & Queue Depths | 7 · The Drowned Dispatch | Nested repetitions · capped lengths and indexed descent | O(n) | O(n) |
| Stack & Queue Depths | 8 · The Tide Window Heist | Bounded-length maximum sum · prefix sums and monotone deque | O(n) | O(n) |
| Sorting Sands | 6 · The Twin Dune Rankings | Strict dominance · tie-aware sort and Fenwick counts | O(n log n) | O(n) |
| Sorting Sands | 7 · The Longest Bazaar Bell | Weighted intervals · event sweep and total peak duration | O(n log n) | O(n) |
| Sorting Sands | 8 · The Costly Caravan Queue | Weighted waiting · sorted releases and max heap | O(n log n) | O(n) |
| Searching Peaks | 6 · The Paired Summit Tribute | K-th pair sum · sort and binary search with two-pointer counting | O(n log n + m log m + (n+m) log W) | O(n+m) |
| Searching Peaks | 7 · The Widest Survey Line | Spacing over coordinate ranges · binary search and batched greedy placement | O(n log n + n log W) | O(n) |
| Searching Peaks | 8 · The Shelter Radius | Restricted-site coverage · sort and binary search with two-pointer greedy coverage | O(n log n + m log m + (n+m) log W) | O(n+m) |
| Tree of Secrets | 6 · The Wandering Root | Weighted distance sums · reroot using subtree sizes | O(n) | O(n) |
| Tree of Secrets | 7 · The Ancestor Debt | Signed downward path sums · DFS with active prefix frequencies | O(n) expected | O(n) |
| Tree of Secrets | 8 · The Many-Coloured Canopy | Distinct subtree labels · Euler intervals and a right-to-left Fenwick sweep | O(n log n) | O(n) |
| Graphbound Kingdom | 6 · The Forged Toll Pass | Single-use discount · Dijkstra on two states per vertex | O((n+m) log(n+m)) | O(n+m) |
| Graphbound Kingdom | 7 · The Falling Bridges | Offline connectivity · reverse deletions and union-find | O(n + (m+q) α(n)) | O(n+m+q) |
| Graphbound Kingdom | 8 · The Crown of Circuits | Collectible graph walk · strongly connected components and DAG DP | O(n+m) | O(n+m) |
| Recursion Realm | 6 · The Balanced Reliquaries | Equal-weight partition · pruned search with failed-mask memoization | O(n·2ⁿ) | O(2ⁿ) |
| Recursion Realm | 7 · The Last Tile Pilgrimage | Hamiltonian grid paths · parity and memoized bitmask search | O(k·2ᵏ) | O(k·2ᵏ) |
| Recursion Realm | 8 · The Echoes Between Bounds | Signed range sums · divide-and-conquer prefix pairs and merge | O(n log n) | O(n) |
| Stringwood Forest | 6 · The One Scar Dispatch | At most one mismatch · forward and reverse Z arrays | O(n+m) | O(n+m) |
| Stringwood Forest | 7 · The Shared Ink Fragment | Longest common substring · suffix automaton | O(n+m) | O(n) |
| Stringwood Forest | 8 · The Whispering Dictionary | Multiple patterns · Aho–Corasick and reverse failure counts | O(T+P) | O(P) |
| Dynamic Programming Dimension | 6 · The Rising Tribute | Fixed-length maximum-sum LIS · layered Fenwick maxima | O(kn log n) | O(n) |
| Dynamic Programming Dimension | 7 · The Finite Armoury | Bounded knapsack · monotone queues on capacity residues | O(n(C+1)) | O(C+1) |
| Dynamic Programming Dimension | 8 · The Unrepeated Vault Digits | Adjacent digit and digit-sum constraints · digit DP | O(d·M·11·10) | O(d·M·11) |

W denotes the relevant coordinate or answer range. The string bounds assume the fixed lowercase alphabet.

From the backend directory, run `node utils/seedHardMissions.js` to validate the reference solutions using the configured Judge0 instance. Run `node utils/seedHardMissions.js --publish` to validate and append the expansion. The publisher checks the existing level identifiers and inserts only missing missions in one transaction. It can reuse validation for previously published, identical missions. It updates the nine island totals in the same transaction.

The configured database now has 87 published missions. Judge0 passed 405 reference executions across C++17, Java and Python 3, plus one run of the shared starter per language. The backend suite passed all 81 tests and the frontend production build succeeded.

The HTTP smoke test used a local copy of the published catalogue. It verified every island's count, gated Case 6 before earlier completions, and ran a real Judge0 submission for Linked Isles Case 6. It checked compiler and runtime errors, Case 7 unlock, Case 8 gating, first-completion rewards, duplicate submission handling and the puzzle milestone. The 60 original database documents, including their IDs, matched their pre-publication hashes.

- Added the nine island banks, `build.js` and `index.js` under `backend/data/hard-missions/`.
- Added `backend/utils/seedHardMissions.js` and `backend/tests/hardMissionBank.test.js`.
- Extended `backend/data/missionBank.js` to build levels 6–8 with buffered Java input.
- Updated the mission counts in `frontend/src/game/constants.js`, `frontend/src/game/progression.js` and `frontend/src/pages/Dashboard.jsx`.
