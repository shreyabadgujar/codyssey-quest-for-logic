# Artifact Archive

Codyssey's puzzles use the existing authenticated player, missions, and coins. Finish two distinct coding missions, then open **Puzzles** in the game navigation or follow **Open Artifact Archive** from the mission result. The Quest Journal lists active, other, and completed trials and previews the selected island, story, objective, and reward. Inside each trial, the briefing, playable mechanism, and expedition record share one parchment spread. Any coding missions count across islands; the island on an artifact identifies its story, not a separate unlock track.

The archive reconciles milestones from durable, rewarded mission records, including missions completed before this feature shipped. It assigns an artifact once per milestone and persists it in MongoDB. The selector first removes seen IDs and prefers a different mechanic, then samples a difficulty at **5% Easy / 20% Medium / 55% Hard / 20% Expert** when all tiers are available. It renormalizes the weights if a tier has no eligible puzzle. After all 30 artifacts have been assigned, previously assigned sessions can still be opened; no repeat rewards are generated.

Each puzzle has three progressive hints and a post-solve explanation. Drafts, hints, attempts, and skipped sessions survive reloads and sign-ins. Reset clears a draft; skip leaves it in the archive. The last saved draft wins across devices, with a revision conflict shown if a tab tries to overwrite a newer state.

## Mechanics

| Interface | What players do |
| --- | --- |
| Detective board | Compare profiles with evidence, rule out suspects, pin decisive records and submit a supported conclusion. |
| Artifact arrangement | Install, rotate, remove and reorder pieces within energy, dependency and yield constraints. Drag the rail or use Earlier/Later. |
| Cipher decoder | Calibrate a symbol wheel, record substitution pairs and apply reverse, alternating, column, rail or rotating packet rules. |
| Expedition maze | Navigate weighted cells, activate switches, collect checkpoints and find a minimum-energy route. |
| Data structure workshop | Run operations on an array, stack, queue, linked list or search tree and reproduce both memory and sensor output. |
| Code restoration | Place safe pseudocode fragments and reconstruct the algorithm's execution trace. The app does not run player-supplied code for this mechanic. |

## Catalogue

| Island | Puzzles (title — ID) |
| --- | --- |
| Array Archipelago | The Missing Relic — `missing-relic`<br>The Merchant's Inventory — `merchants-inventory`<br>The Duplicate Trail — `duplicate-trail` |
| Linked Isles | Reconnect the Broken Chain — `broken-chain`<br>The Messenger Relay — `messenger-relay`<br>The Looping Island — `looping-island` |
| Stack & Queue Depths | The Forgotten Stack — `forgotten-stack`<br>The Royal Waiting Line — `royal-waiting-line`<br>The Undo Spell — `undo-spell` |
| Sorting Sands | The Sandstorm Sort — `sandstorm-sort`<br>The Merchant's Bargain — `merchants-bargain`<br>The Broken Ranking — `broken-ranking` |
| Searching Peaks | The Oracle's Number — `oracles-number`<br>The Hidden Peak — `hidden-peak`<br>The Lost Map Index — `lost-map-index` |
| Tree of Secrets | The Family Portrait — `family-portrait`<br>The Root's Message — `roots-message`<br>The Missing Branch — `missing-branch` |
| Graphbound Kingdom | The Island Messenger — `island-messenger`<br>The Bridgekeeper's Route — `bridgekeepers-route`<br>The Isolated Village — `isolated-village` |
| Recursion Realm | The Recursion Mirror — `recursion-mirror`<br>The Tower of Echoes — `tower-of-echoes`<br>The Unwinding Spell — `unwinding-spell` |
| Stringwood Forest | The Archivist's Cipher — `archivists-cipher`<br>The Palindrome Gate — `palindrome-gate`<br>The Scrambled Scroll — `scrambled-scroll` |
| Dynamic Programming Dimension | The Climbing Expedition — `climbing-expedition`<br>The Treasure Budget — `treasure-budget`<br>The Twin Paths — `twin-paths` |

## Persistence, validation, and rewards

The backend catalogue is stored in `backend/data/puzzles`. The `PuzzleSession` collection uses unique indexes on `(user, milestone)` and `(user, puzzleId)`. The session stores status, draft, revision, hint count, attempt count, verdict, credited coins and completion date. Authentication and ownership scope every session read and write. Private validation data stays in backend modules.

The server checks the solution, records the completed session and credits the existing player balance in one MongoDB transaction. Easy/Medium/Hard/Expert awards are 15/25/40/60 coins. The first solve also grants **First Mystery Solved** through the existing achievement ledger. The profile journal includes the solved artifact and its coins. No new currency or mission-progress ledger is used.

## Verification and manual run

1. From the backend directory, run `npm test` and `npm run dev`. Configure the existing Atlas and Judge0 settings for live mission completion.
2. From the frontend directory, run `npm run build` and `npm run dev`. Sign in with a test account and finish two different coding cases. A failed submission or replay of an accepted case should not advance the artifact milestone.
3. Open **Puzzles**, activate an artifact, change something, and request a hint. Wait for **Draft saved**, then reload. Verify the same artifact, draft and hint are present. Make a change in one tab and check that a stale second tab is asked to reload.
4. Skip and reopen from **Other Quests**. Reset the draft and check that hints are retained. Solve the artifact, then reopen it from **Completed** and check the explanation and the unchanged balance. Check **Profile** and **Achievements**.
5. Test the assembly rail with both its drag grips and the Earlier/Later buttons. Use Tab and Enter to play on other boards. Resize the browser to check the single-column layout.

The backend suite includes a case for every authored puzzle, separate deductions and trace calculations, exhaustive subset optimization, cost-layer pathfinding, session and reward tests, and the existing Judge0, mission, shop, avatar, achievement and profile regressions.

## Verification results

- `npm test` (backend): 77 passing tests, including all 30 catalogue puzzles.
- `npm run build` (frontend): passed; Vite emitted the existing Monaco bundle size warning.
- Live Atlas/Judge0: a Wrong Answer did not count. Judge0 accepted **The Ledger of Fallen Glyphs** and **The Headkeeper's Route**; only the second completion unlocked an artifact. Concurrent archive reads returned the same session.
- In the browser, **The Lost Map Index** retained its draft and hint after refresh and skip/revisit, reset preserved the hint, and solving credited 40 coins. Profile and Achievements showed the result. Re-login preserved it, and concurrent duplicate submit requests did not change the balance. A 390 px viewport had no horizontal overflow.
- To verify the remaining interfaces, historical completions were added to the disposable test account only. All 30 puzzles appeared in the archive. The browser solved **The Missing Relic**, **The Merchant's Inventory** (using keyboard reordering), **The Hidden Peak**, **The Palindrome Gate**, and **The Messenger Relay**. The test account and its records were then removed.

## Source changes

| Area | Files |
| --- | --- |
| New catalogue | `backend/data/puzzles/{entry,index,detective,arrangement,cipher,maze,workshop,code}.js` |
| New backend | `backend/models/PuzzleSession.js`, `backend/services/{puzzleService,puzzleSelectionService,puzzleValidationService}.js`, `backend/controllers/puzzleController.js`, `backend/routes/puzzleRoutes.js` |
| Backend integration | `backend/routes/index.js`, `backend/server.js`, `backend/services/{rewardService,profileService}.js`, `backend/data/achievements.js` |
| New frontend | `frontend/src/pages/Puzzles.jsx`, `frontend/src/hooks/usePuzzleSession.js`, `frontend/src/services/puzzleService.js`, `frontend/src/styles/puzzles.css`, `frontend/src/components/puzzles/{DetectiveBoard,ArtifactArrangement,CipherDecoder,ExpeditionMaze,StructureWorkshop,CodeRestoration,QuestOrnaments}.jsx` |
| Frontend integration | `frontend/src/App.jsx`, `frontend/src/components/{Navbar,ProfileActivity}.jsx`, `frontend/src/pages/Mission.jsx`, `frontend/src/styles/tokens.css` |
| Tests and docs | `backend/tests/{puzzleBank,puzzleSessions,achievements}.test.js`, `API_CONTRACT.md`, `PUZZLE_ARCHIVE.md` |
