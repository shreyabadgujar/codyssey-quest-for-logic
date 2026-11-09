# Coding platform implementation status

## Phase 1: backend-owned evaluation

The backend suite passes 23 automated tests and the frontend production build passes. Judge0 smoke programs covered C, C++17, Java, Python, and failure verdicts. The expansion journey checks use the running API, live Judge0, and MongoDB to verify completion and reward transactions on fresh QA accounts.

Implemented:
- Judge0 CE language-catalog verification, base64 submissions, bounded polling, request deadlines and response-size limits.
- Backend-controlled C/C++17/Java/Python language IDs; CPU, wall-time, memory and file-size limits; network disabled in each sandbox request.
- Sequential test evaluation and explicit verdicts. No student/reference code runs in Node or through local subprocesses.
- Exact comparison with documented whitespace normalization; trusted server validator registry supporting unordered lines with multiplicity.
- Hidden execution output suppression, including errors that could echo hidden stdin.
- Strict request validation and authenticated, rate-limited Run/Submit routes.
- Cross-process per-user database lease; first-completion rewards and progress committed in one transaction.
- Reference validator runs every sample and hidden case in C++17, Java, and Python 3. Approval is tied to a content fingerprint.
- Automated tests use Node's built-in test runner, fake Judge0 responses and injected persistence adapters. These are not live MongoDB transaction tests.

Run from the project root in PowerShell:

```powershell
cd backend
npm test
npm run judge:smoke
npm run validate:mission -- <mission-object-id>
npm run dev
```

In a separate terminal:

```powershell
cd frontend
npm run build
npm run dev
```

Keep real secrets in backend/.env. The example file lists configuration names only. Node 20+ is required for built-in fetch and Web APIs. Atlas transactions are required for reward commits. The public Judge0 API does not imply unlimited capacity, availability, or guaranteed sandbox configuration; deploy only against a maintained and isolated Judge0 service.

## Validation protocol for every authored mission

1. Review its precise specification, examples, assumptions, constraints, editorial and reward values.
2. Independently derive expected outputs using a separate oracle, preferably brute force over small randomized cases. A reference agreeing with its own generated answers is insufficient.
3. Include boundary and maximum-size tests within the 1 MiB per-test input limit, and a nonempty hidden suite. Current evaluation cap: 100 tests, 180 seconds overall; fail-closed if exceeded. Adjust architecture deliberately for larger suites.
4. Store full-program references in `referenceSolutions.c/cpp/java/python`; Java uses `public class Main`. Reference source never belongs in frontend assets.
5. Run `validate:mission` against the provisioned Judge0 instance. A failed language leaves approval absent. Revalidate after any relevant content or limit change.
6. Compare intended and deliberately inefficient solutions using realistic language-specific constraints. Timing calibration and independent oracle review are separate from the automated reference-pass gate.
7. Publish only after the review checklist and live reference validation both pass. The current gate verifies reference passage, not mathematical correctness or completeness of the test bank.

## Published mission bank

Array Archipelago has 15 existing validated missions. The expansion adds five missions per island in the requested order.

| Island | New complete missions | Validated missions | Target |
|---|---:|---:|---:|
| Array Archipelago | 0 | 15 | 15 |
| Stringwood Forest | 5 | 5 | 5 |
| Linked Isles | 5 | 5 | 5 |
| Stack and Queue Depths | 5 | 5 | 5 |
| Sorting Sands | 5 | 5 | 5 |
| Searching Peaks | 5 | 5 | 5 |
| Recursion Realm | 5 | 5 | 5 |
| Tree of Secrets | 5 | 5 | 5 |
| Graphbound Kingdom | 5 | 5 | 5 |
| Dynamic Programming Dimension | 5 | 5 | 5 |

- [x] Publish Array Archipelago's 15 missions after C++17, Java, and Python reference checks.
- [x] Connect MongoDB mission routes to the existing Monaco lab and server progression.
- [x] Remove Test-Solve controls.
- [x] Publish and test Stringwood Forest.
- [x] Publish and test Linked Isles.
- [x] Publish and test Stack and Queue Depths.
- [x] Publish and test Sorting Sands.
- [x] Publish and test Searching Peaks.
- [x] Publish and test Recursion Realm.
- [x] Publish and test Tree of Secrets.
- [x] Publish and test Graphbound Kingdom.
- [x] Publish and test Dynamic Programming Dimension.
- [x] Verify live first-completion and repeated-submission reward behavior on fresh QA accounts.
- [ ] Exercise injected database failures and concurrent writes against an isolated MongoDB replica-set test database.
- [ ] Implement island completion, treasure collection, rank updates and achievement integration separately.

No Git checkpoint exists because this workspace has no Git repository.

Expansion checkpoints are written to `backend/validation/<island-slug>-report.json` after every mission for that island passes its live Judge0 reference suite in all three languages and the database transaction commits. Run `node utils/seedIslandMissions.js <island-slug>` from the backend folder to validate and publish an island. Run `node utils/checkIslandJourney.js <island-slug>` with the local backend running to check the full progression on a fresh QA account.

## Expansion verification

The database contains ten islands and 60 current mission validation fingerprints. All 45 new cases passed their complete visible and hidden suites in C++17, Java, and Python 3. The new bank contains 243 test inputs, for 729 required reference executions.

An authenticated QA journey submitted all five cases on each new island in order. It checked the initial lock, private-field omission, editorial access, sample runs without rewards, first-completion XP and coins, duplicate submission rewards, and Array progress independence. The later journeys also checked custom input. Browser checks opened the first case of each new island from the map and exercised Monaco with successful C++17, Java, and Python execution, Wrong Answer, compilation errors, runtime errors, rewards, and unlocking.

## Files in the nine-island expansion

Created:

- `backend/data/missionBank.js`
- `backend/data/stringwood-forest.js`
- `backend/data/linked-isles.js`
- `backend/data/stack-queue-depths.js`
- `backend/data/sorting-sands.js`
- `backend/data/searching-peaks.js`
- `backend/data/recursion-realm.js`
- `backend/data/tree-of-secrets.js`
- `backend/data/graphbound-kingdom.js`
- `backend/data/dynamic-programming-dimension.js`
- `backend/utils/seedIslandMissions.js`
- `backend/utils/checkIslandJourney.js`
- `backend/tests/expansionBank.test.js`
- `backend/validation/stringwood-forest-report.json`
- `backend/validation/linked-isles-report.json`
- `backend/validation/stack-queue-depths-report.json`
- `backend/validation/sorting-sands-report.json`
- `backend/validation/searching-peaks-report.json`
- `backend/validation/recursion-realm-report.json`
- `backend/validation/tree-of-secrets-report.json`
- `backend/validation/graphbound-kingdom-report.json`
- `backend/validation/dynamic-programming-dimension-report.json`

Modified:

- `backend/services/missionService.js`
- `frontend/src/pages/Mission.jsx`
- `API_CONTRACT.md`
- `IMPLEMENTATION_STATUS.md`

The expansion reuses the Case File, Monaco editor, language selector, output console, test-case results, map and island navigation, Judge0 adapter, and server progression. The mission response adds the island's case count. Run, Submit, and editorial requests use the existing endpoints.

## Evaluation foundation files

- Modified: backend/models/Mission.js; backend/services/judge0Service.js, progressService.js, rewardService.js; backend/controllers/submissionController.js; backend/routes/submissionRoutes.js; backend/package.json; API_CONTRACT.md.
- Added: backend/models/SubmissionLease.js; backend/services/outputValidators.js, evaluationService.js, missionValidationService.js, submissionService.js; backend/utils/validateMission.js, judgeSmoke.js; backend/tests/evaluation.test.js, judge0.test.js, rewards.test.js, submissions.test.js; backend/.env.example; this checklist.
