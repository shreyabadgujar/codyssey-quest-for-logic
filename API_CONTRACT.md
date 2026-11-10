# API Contract (mixed implementation; unrelated game endpoints remain stubs)

Base: `/api`. Auth: `Authorization: Bearer <jwt>` unless marked public.
Success `{ "data": ... }` · Error `{ "error": { "message": "", "code": "" } }`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | /health | public | Liveness check (implemented) |
| POST | /auth/register | public | `{ username, email, password }` → `{ user, token }` |
| POST | /auth/login | public | `{ email, password }` → `{ user, token }` |
| GET | /auth/me | yes | Current user |
| GET | /users/me | yes | Full profile: xp, level, coins, avatar, inventory, streak |
| GET | /users/me?view=journal | yes | Personal expedition journal with puzzle totals, public achievement records and summary, full owned inventory, equipped cosmetics, and up to 8 dated activity entries |
| PATCH | /users/me/avatar | yes | `{ base: "explorer-01" }` or `{ slot, itemId }` → updated profile |
| POST | /users/me/streak/claim | yes | Claim daily streak reward (server decides amount) |
| GET | /islands | yes | All islands + per-user completion status and `lastCompletedAt` per island |
| GET | /islands/:id | yes | Island + levels with `locked/unlocked/completed` |
| GET | /missions/:id | yes | Mission with island case count and sample tests. 403 if locked |
| GET | /missions/:id/editorial | yes | Editorial for an unlocked case, requested separately |
| POST | /submissions | yes | `{ missionId, language: "c"|"cpp"|"python"|"java", code }` → `{ verdict, passed, results[], rewards?, clue?, hiddenObject? }` |
| POST | /submissions/run | yes | Same request, optional `input` (custom stdin). Samples/custom input only; never rewards or unlocks. |
| POST | /missions/:id/find-object | yes | `{ position:{x,y} }` → `{ found, bonus? }` (server-verified) |
| GET | /shop/items | yes | Catalogue entries with `id`, `slot`, `price`, `asset`, `visual`, `description`, and `owned` |
| POST | /shop/purchase | yes | `{ itemId }` (ShopItem ObjectId) → updated player profile including `coins` and `inventory` |
| GET | /achievements | yes | `{ items, summary, balance }` with personal progress, earned rewards and sealed hidden entries |

Shop slots are `frame`, `background`, `pin`, and `companion`. The server initializes the starter catalogue on startup when MongoDB is configured. Purchases use the stored price and update the account balance and inventory together. A duplicate or unaffordable purchase returns 409 with `ITEM_ALREADY_OWNED` or `INSUFFICIENT_COINS`. Buying adds ownership without changing avatar equipment.

The journal uses the authenticated account ID exclusively. It derives mission, exploration and badge totals from existing records. New purchases record `User.inventoryPurchases` with the actual timestamp in the same atomic update as ownership and balance. Previously purchased items stay owned and have no dated activity entry.

Avatar equipment uses the same slots. Pass an owned ShopItem ID to replace the item in that slot or `null` to clear it. A wrong-slot or missing item returns 404 `EQUIPMENT_NOT_FOUND`. An unowned item returns 403 `ITEM_NOT_OWNED`. Equipping does not change coins, inventory, the base portrait, or other slots.

Rules: clients never send rewards/XP/coins/completion; hidden test cases never appear in any response; rewards are granted once per mission.

First mission completions may include newly earned badges in `data.rewards.achievements`. Achievement coins are credited in the same transaction and are separate from `data.rewards.coins`, which is the mission reward. The achievements list reconciles eligible historical completions and returns the resulting balance. Hidden names, rules, progress and rewards are withheld until unlocked. Flawless Solver uses new tracked completions, and completion days use UTC.

## Implemented evaluation contract

- `missionId` is a MongoDB ObjectId, not the temporary frontend `island-level` identifier. Unknown request fields are rejected.
- Code must be nonblank and at most 65,536 UTF-8 bytes. Custom stdin is at most 16,384 bytes. Request JSON remains limited to 100 KB.
- Both routes check server-side unlock state and require current reference validation. Unvalidated missions return 503 `MISSION_NOT_VALIDATED`; locked missions return 403 `MISSION_LOCKED`.
- At most 10 evaluation requests per account per minute per API process; a database lease permits one active evaluation per account across processes. Concurrent requests return 409 `SUBMISSION_BUSY`.
- Verdicts: `Accepted`, `Wrong Answer`, `Compilation Error`, `Runtime Error`, `Time Limit Exceeded`, `Internal Judge Error`. A successful custom-input run returns `Executed`, with `passed: false`, because it has no expected answer.
- Sample runs can return `Accepted` for samples only. Only POST `/submissions` can grant rewards.
- Results stop at the first failure. Each result has `verdict` and `hidden`. Visible cases also include `stdout`, `stderr`, `compileOutput`, `time`, and `memory`. Hidden cases never return these fields, input, expected output, or Judge0 tokens.
- Judge failures return `data.verdict: "Internal Judge Error"`, `passed: false`; no reward or clue. Infrastructure failures before evaluation can return standard HTTP errors.
- Successful submission rewards are `{ xp, coins, firstCompletion }`; repeated completion returns zero rewards. Completion and user balance changes share a MongoDB transaction (Atlas/replica set required).
- Comparator normalizes CRLF/CR, strips trailing spaces/tabs per line and terminal newlines. Leading whitespace, interior spacing, blank interior lines and case remain significant. An explicitly configured `unorderedLines` validator preserves duplicate counts.
- Mission reference validation covers C++17, Java and Python 3. Tests, references, description, limits, and validator changes invalidate the stored fingerprint. Hidden, reference, and validation fields use `select: false`.

## Artifact puzzles (authenticated)

The archive unlocks one puzzle per two distinct successfully rewarded coding missions. A first-completion submission response includes `rewards.puzzleMilestone` on an eligible even milestone. Puzzle play never gates coding progression.

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/api/puzzles` | Assigns earned milestones and returns `catalogue`, `current`, newest-first `history`, `missionsCompleted`, `missionsTotal`, `missionsToNext`, `nextReachable` and `exhausted`. Assignments are persisted and cannot reroll. |
| GET | `/api/puzzles/:id` | Reads a player-owned session and its public puzzle data, draft, revision, unlocked hints and verdict. Solution explanation appears only after completion. |
| POST | `/api/puzzles/:id/start` | Activates or resumes a session. Also revisits a skipped puzzle and restores its draft. |
| POST | `/api/puzzles/:id/draft` | Saves the mechanic-specific draft. Body: `{ revision, draft }`. |
| POST | `/api/puzzles/:id/hint` | Unlocks the next hint, up to the number of authored hints. |
| POST | `/api/puzzles/:id/reset` | Clears the draft and last verdict; preserves unlocked hints and attempt count. |
| POST | `/api/puzzles/:id/skip` | Archives a pending session as skipped; it remains available through history. |
| POST | `/api/puzzles/:id/submit` | Validates the saved draft. Returns `correct`, `incorrect`, `incomplete` or `invalid`. On first success, returns `awarded` and any newly unlocked achievements. A repeated solve returns `alreadyRewarded` without crediting coins. |

Other POST bodies are `{ revision }`; revisions come from the latest session response. A stale write returns `409 PUZZLE_CONFLICT`; reload to resume the server's saved state. Invalid or unowned session IDs return `404 PUZZLE_NOT_FOUND`. Journal activity may include `{ kind: "puzzle", coins, ... }`.

Each `catalogue` entry contains `puzzleId`, `title`, `islandId`, `islandName`, `difficulty`, `synopsis`, `mechanic` and `status`. New entries also include concept `tags`. Assigned entries include the signed-in player's `sessionId` and `sessionStatus`. An assigned trial is `available` (including active and skipped) or `completed`. An unassigned trial is `upcoming` when the next draw is reachable with one remaining successful mission and the trial is a candidate for that draw. Other unassigned trials are `locked`. Upcoming and locked entries are previews and have no session ID. `nextReachable` compares the next milestone with the published mission count. `exhausted` indicates that every selectable puzzle has been assigned.
