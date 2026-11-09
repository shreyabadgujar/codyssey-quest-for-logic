# Interactive puzzle expansion

The journal now contains 60 puzzles, six on each of the ten islands.

| Island | Difficulty | New puzzle | Mechanic | DSA concepts |
|---|---|---|---|---|
| Array Archipelago | Medium | The Floodline Index | Expedition Maze | Flattened arrays, row-major indexing, and weighted grid routes |
| Array Archipelago | Hard | The Castaway’s Spindle | Cipher Decoder | Circular arrays, modular indexing, and permutation cycles |
| Array Archipelago | Expert | The Broken Tide Ledger | Code Restoration | Maximum subarray with one deletion and rolling states |
| Linked Isles | Medium | The Mooring Switchboard | Artifact Arrangement | Linked-list splices and pointer dependencies |
| Linked Isles | Hard | The Vanishing Link | Detective Board | Pointer rewiring and reachability |
| Linked Isles | Expert | The Two-Handed Ferryman | Code Restoration | Two-pointer list intersection |
| Stack & Queue Depths | Medium | The Flooded Dispatch Queue | Data Structure Workshop | FIFO and duplicate entries |
| Stack & Queue Depths | Hard | The Bell Between Towers | Code Restoration | Monotone stack and next greater element |
| Stack & Queue Depths | Expert | The Turnstile Under Siege | Artifact Arrangement | Queue dependencies and knapsack |
| Sorting Sands | Medium | The Stable Sand Seal | Detective Board | Stable sorting and ties |
| Sorting Sands | Hard | The Customs Sort Yard | Artifact Arrangement | Stable sorting and dependency graphs |
| Sorting Sands | Expert | The Equal-Key Tribunal | Code Restoration | Counting sort, prefix sums, and stability |
| Searching Peaks | Medium | The Surveyor’s Switchback | Expedition Maze | Shortest paths with a switch state |
| Searching Peaks | Hard | The Bisection Strip | Cipher Decoder | Two boundaries and transposition |
| Searching Peaks | Expert | The False Summit Ledger | Detective Board | Binary search, lower bounds, and invariants |
| Tree of Secrets | Medium | The Inked Sapling | Data Structure Workshop | BST search and inorder traversal |
| Tree of Secrets | Hard | The Ancestor’s Alibi | Detective Board | Preorder, subtrees, and lowest common ancestor |
| Tree of Secrets | Expert | The Rerooted Lanterns | Code Restoration | Weighted rerooting and subtree sizes |
| Graphbound Kingdom | Medium | The Quarantine Gates | Artifact Arrangement | Directed dependencies and topological order |
| Graphbound Kingdom | Hard | The Tidal Cut | Expedition Maze | State-expanded shortest paths |
| Graphbound Kingdom | Expert | The Sealed Circuit | Detective Board | Directed reachability and strong connectivity |
| Recursion Realm | Medium | The Forked Echo | Code Restoration | Branching recursion, base cases, and preorder |
| Recursion Realm | Hard | The Mirror Dispatch | Cipher Decoder | Reversal parity and alternating traversal |
| Recursion Realm | Expert | The Unfinished Frames | Data Structure Workshop | Call stacks and trace reconstruction |
| Stringwood Forest | Medium | The Diagonal Vines | Cipher Decoder | Diagonal string indexing |
| Stringwood Forest | Hard | The Split Bark Buffer | Data Structure Workshop | Buffer edits and first-occurrence queries |
| Stringwood Forest | Expert | The Overlap Loom | Artifact Arrangement | String overlap and shared prerequisites |
| Dynamic Programming Dimension | Medium | The Satchel Ledger | Data Structure Workshop | State tables and index updates |
| Dynamic Programming Dimension | Hard | The Forked Harvest | Artifact Arrangement | Budget optimization and state transitions |
| Dynamic Programming Dimension | Expert | The Two-Key Frontier | Expedition Maze | Bitmask state and weighted routing |

The existing draw runs at each earned two-mission milestone. It uses the registered puzzle bank, excludes previously assigned puzzles, and applies the same difficulty weights and mechanic preference. All 60 are eligible for a draw. The current 87 missions allow 43 assignments per account. The journal displays when a next milestone exceeds the published mission count. Expanding the bank requires no data migration.

## Files changed

- New puzzle data in `backend/data/puzzles/expansion/`: `arrangement.js`, `build.js`, `cipher.js`, `code.js`, `detective.js`, `index.js`, `maze.js`, and `workshop.js`.
- Registration and API logic in `backend/data/puzzles/index.js`, `backend/services/puzzleService.js`, and `backend/services/puzzleValidationService.js`.
- Journal and trial controls in `frontend/src/pages/Puzzles.jsx`, `frontend/src/components/puzzles/ExpeditionMaze.jsx`, and `frontend/src/components/puzzles/StructureWorkshop.jsx`.
- Regression coverage in `backend/tests/puzzleBank.test.js` and `backend/tests/puzzleSessions.test.js`.
- Documentation in `API_CONTRACT.md`, `PUZZLE_ARCHIVE.md`, and this report.

## Verification of the initial 27 additions

- All 110 backend tests passed. Automated coverage independently checked all 27 solutions and exercised saved interaction state, incorrect submissions, three hints per puzzle, completion, post-solve explanations, and one-time coin rewards.
- The production frontend build passed with a bundle-size warning.
- The live journal displayed all 57 entries in ten island groups. Six trials were solved in the browser against an isolated test database, one per mechanic. They were The Stable Sand Seal, The Mooring Switchboard, The Diagonal Vines, The Surveyor’s Switchback, The Unfinished Frames, and The Forked Echo. Each showed its coin reward after completion.
- The isolated API check used all 87 published mission definitions and preserved the original 30 assignment records in a legacy account fixture. It added the 13 assignments that account had earned and left 14 quests locked.
