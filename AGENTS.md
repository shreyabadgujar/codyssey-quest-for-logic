# AGENTS.md — Codyssey: Quest for Logic

Guide for the next coding agent. Read fully before changing anything.

## 1. Purpose
Mystery-detective game teaching DSA. Player picks an island (DSA topic) → enters an unlocked level → reads a mystery → solves a coding mission in C / C++ / Python / Java → passes test cases → receives a story clue → finds a hidden object on the island map → earns coins + XP → next level unlocks. Also: avatars, cosmetics, coin shop, achievements, optional daily streak, island artifacts, a final mystery after all islands.

## 2. Stack
- Frontend: React 18 + Vite, JSX (no TypeScript), Tailwind CSS 3, React Router 6, Axios, `@monaco-editor/react`, `motion` (`import { motion } from "motion/react"`), `lucide-react`.
- Backend: Node + Express (CommonJS), Mongoose / MongoDB Atlas, JWT, bcryptjs, dotenv, helmet, cors, express-rate-limit.
- Code execution: Judge0 API, called **only from backend** (`backend/services/judge0Service.js`, currently a stub).

## 3. Folder structure
```
frontend/src/
  components/  reusable UI (skeletons); ui/ holds decorative primitives
  pages/       one file per route (12 pages)
  layouts/     MainLayout (Navbar + parchment shell)
  context/     AuthContext (skeleton)
  hooks/       custom hooks
  services/    axios client + one module per API area
  game/        pure game constants/helpers (languages, difficulty, rank math)
  data/        static data (islands.js). Missions live in MongoDB, not here.
  styles/      tokens.css (design tokens) + index.css (Tailwind + component classes)
  utils/
frontend/public/assets/{maps,islands,characters,accessories,objects,textures}
backend/
  config/ controllers/ middleware/ models/ routes/ services/ utils/ server.js app.js
```
Flow: route → controller (HTTP only) → service (business logic) → model.

## 4. Visual identity: THE AETHERIAN CARTOGRAPHY AESTHETIC
Ancient explorer's journal + detective adventure. Reference: antique nautical fantasy map (aged parchment, sepia, ink-drawn islands, compass rose, ornamental title cartouches, sea monsters, ship engravings).
Use: parchment backgrounds, sepia/beige/brown, espresso text, antique gold/brass accents, muted olive for land, vintage serif display type (IM Fell), readable serif body (Spectral), hand-drawn illustration, ornamental double-rule borders, compass roses, handwritten-style annotations, subtle paper shadows.
**Never use:** purple or blue-purple gradients, SaaS-dashboard look, generic startup landing layouts, heavy glassmorphism, neon/cyberpunk, rows of identical rounded cards, emoji as artwork, ultra-minimal modern layouts.
Always take colours, fonts, spacing, shadows from `styles/tokens.css` (CSS variables, mapped in `tailwind.config.js`). Do not hardcode hex values in components. Reusable classes: `.paper`, `.folio`, `.cartouche`, `.btn-brass`, `.btn-ghost`, `.annotation`, `.rule-ornate`. The world map must become a custom illustrated interactive map (SVG/image layers + positioned `IslandMarker`s), never a card grid. Missing artwork → use a styled placeholder, not an emoji. Respect `prefers-reduced-motion`; keep focus rings visible.

## 5. Coding conventions
- Functional components, hooks, named exports for components, default export for pages.
- One component per file, PascalCase filenames; hooks `useX.js`; services `xService.js`.
- No business logic in components; call `services/*`. No extra dependencies without a clear need.
- Stubs that are unfinished must say `TODO` and return 501 on the backend. Do not fake behaviour.
- Comment only non-obvious architecture decisions.

## 6. API conventions
- Base path `/api`. JSON in/out. Success: `{ data }`. Error: `{ error: { message, code } }`.
- Frontend uses the single Axios instance in `services/api.js` (attaches JWT, normalises errors). Never call `fetch`/axios ad hoc in components.
- Full endpoint list: `API_CONTRACT.md`. Update it whenever endpoints change.

## 7. Security requirements
- Secrets only in `backend/.env`. Judge0 key never reaches the browser.
- Hash passwords with bcryptjs; JWT via `Authorization: Bearer`; protect routes with `middleware/auth.js`.
- **Never run user code on the app server.** Submit to Judge0 only.
- **Never trust client-sent rewards, XP, coins, completion, or unlock state.** The server computes them from Judge0 results.
- Hidden test cases and starter solutions are `select: false` / never serialised to clients; the client only sees sample cases.
- Validate and sanitise all input; keep helmet, CORS allow-list (`CLIENT_ORIGIN`) and rate limits (stricter on auth and submissions).

## 8. Progression & rewards (server-authoritative)
1. All islands are visible. Level 1 of every island is unlocked; level N+1 unlocks only when a `Progress` record for level N has `status: "completed"`.
2. `POST /api/submissions` → server loads mission (including hidden tests) → runs all tests via Judge0 in the chosen language → if all pass, `progressService` marks completed **once**, then `rewardService` grants XP/coins from the mission document and returns the story clue + hidden object info.
3. Rewards are granted only on first completion (idempotent; resubmissions give nothing). Never accept reward values from the request.
4. Finding the hidden object (treasure hunt) is verified server-side against the mission's `hiddenObject` position; may grant a bonus defined on the mission.
5. Completing all levels of an island grants the island's `completionReward` (coins, XP, artifact). Completing all islands reveals the final mystery.
6. Streaks (optional): one claim per UTC day, computed server-side. Achievements are evaluated server-side after relevant events. Shop purchases check balance server-side and are atomic.

## 9. Adding islands and missions
- Island: add an entry in `frontend/src/data/islands.js` (`id`, `name`, `topic`, `description`, `image`, `mapPosition` as % of map, `totalLevels`, `completionReward`) and a matching document in the `Island` collection (seed script is a TODO). Add artwork to `public/assets/islands/`.
- Mission: create a `Mission` document (fields in `backend/models/Mission.js`): `islandId`, `level` (unique per island), `title`, `difficulty`, `description`, `starterCode{c,cpp,python,java}`, `sampleTestCases`, `hiddenTestCases`, `storyClue`, `hiddenObject{name,position,asset}`, `xpReward`, `coinReward`. Levels must be contiguous from 1. A seed/import script under `backend/utils/` is a TODO.

## 10. Testing
- Frontend: `cd frontend && npm run dev`; `npm run build` must pass. Check all routes render.
- Backend: `cd backend && npm run dev`; `GET http://localhost:5000/api/health` returns `{ data: { status: "ok" } }`. Unimplemented routes return 501.
- No test framework is configured yet. When adding logic, add Vitest (frontend) / Jest or node:test (backend) for progression and reward services first.

## 11. Open TODOs
Auth flow, user profile, island/mission endpoints, Judge0 integration, progress/reward services, seed scripts, illustrated map artwork, avatar/shop/achievement logic, streaks, final mystery, tests.
