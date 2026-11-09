# Codyssey – Quest for Logic

A detective-adventure game for learning Data Structures & Algorithms. Explore the Archipelago of Ætheria, solve coding mysteries, follow story clues to hidden objects, and unlock the next level.

> Status: **framework only.** Routing, design system, component skeletons, schemas and API stubs exist. Game features are not implemented yet. See `AGENTS.md` for the build guide and `API_CONTRACT.md` for planned endpoints.

## Stack
Frontend: React, Vite, Tailwind CSS 3, React Router, Axios, Monaco, Motion, Lucide.
Backend: Node, Express, MongoDB (Mongoose), JWT, bcryptjs. Code execution: Judge0 (planned).

## Setup
```bash
cp .env.example backend/.env      # then fill in values (MongoDB Atlas URI, JWT secret)
cp .env.example frontend/.env     # optional, only VITE_* values are read
npm run install:all

# terminal 1
npm run dev:backend               # http://localhost:5000/api/health
# terminal 2
npm run dev:frontend              # http://localhost:5173
```
The backend starts without MongoDB configured (health check works, DB is skipped with a warning).

## Not implemented yet
Auth logic, progression/rewards, Judge0 submission, mission content, illustrated world map art, shop/avatars/achievements logic, streaks, final mystery. Stubs return `501 Not Implemented`.
