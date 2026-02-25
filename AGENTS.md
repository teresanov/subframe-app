# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Nexus is a React + TypeScript SPA (Single Page Application) for procurement BOM (Bill of Materials) lifecycle management. The UI is entirely in Spanish. There is **no backend** — all data is mocked in-code and persisted in browser `localStorage`.

### Tech stack

- React 18, TypeScript 5, Vite 6, Tailwind CSS 3, Subframe design system
- Package manager: **npm** (lockfile: `package-lock.json`)

### Standard commands

See `package.json` scripts and `README.md` for canonical commands:

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (port 5173) |
| Build | `npm run build` (`tsc && vite build`) |
| Lint | `npm run lint` |
| Preview prod | `npm run preview` |

### Non-obvious notes

- **Lint `--max-warnings 0`**: The project enforces zero warnings. As of this writing there are 6 pre-existing warnings (react-hooks/exhaustive-deps, react-refresh/only-export-components). `npm run lint` exits non-zero due to these.
- **No test framework**: There are no automated tests configured (`jest`, `vitest`, etc.). Validation is done via lint, build, and manual testing.
- **No backend or database**: The app works entirely client-side with mock data. An optional `VITE_API_URL` env var in `src/api/revision.ts` can point to a BOM API, but the app gracefully falls back to local mocks.
- **Routing**: The app uses `react-router-dom` v7. The root `/` shows an onboarding page; the main app lives under `/app/*`.
- **Dev server host**: Use `npm run dev -- --host 0.0.0.0` to make the dev server accessible from outside localhost (useful in cloud/container environments).
