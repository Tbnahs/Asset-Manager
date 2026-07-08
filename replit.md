# CHECKEE F&B

A school food-monitoring mobile app (Expo + React Native) that lets parents track weekly meal menus, food safety results, ingredient traceability, and submit feedback — backed by an Express 5 API server.

## Run & Operate

- **Web preview:** workflow `API Server` — Express 5 on port 8080 serves both the Expo web build (all routes) and the API (`/api/*`); opens directly in the preview pane
- **Expo App:** workflow `Expo App` — serves the same web build via a standalone Node server on port 5000 (webview); backup path for native preview
- To rebuild the web bundle after UI changes: `cd artifacts/checkee-fnb && pnpm exec expo export --platform web`
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes to Postgres (dev only)
- Required env (when DB features are used): `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.9
- Mobile: Expo ~54 + Expo Router (file-based routing), React Native
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (not yet connected — add `DATABASE_URL` secret when needed)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → `@workspace/api-client-react`)
- Build: esbuild (CJS bundle for API server)

## Where things live

- `artifacts/checkee-fnb/` — Expo mobile app
  - `app/` — Expo Router screens
  - `components/` — shared UI components
  - `constants/colors.ts` — design tokens
  - `data/mockData.ts` — mock meal/notification data (Vietnamese content)
  - `types/index.ts` — shared TypeScript types
- `artifacts/api-server/` — Express API server
  - `src/routes/` — route handlers (currently: health only)
  - `src/lib/` — logger and utilities
- `lib/db/` — Drizzle ORM schema and client
- `lib/api-spec/` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/` — generated React Query hooks (from codegen)
- `lib/api-zod/` — generated Zod schemas (from codegen)

## Architecture decisions

- OpenAPI-first: all API contracts live in `lib/api-spec/openapi.yaml`; frontend hooks are generated via Orval — edit the spec, then run codegen
- Expo app currently uses mock data (`data/mockData.ts`); real API integration goes through `@workspace/api-client-react`
- API server builds to a CJS bundle (esbuild) before starting, even in dev mode
- Vietnamese-language UI content throughout the mobile app

## Product

School food monitoring for parents: weekly meal menus with nutritional info and ingredient origins, food safety inspection results, traceability records, and a feedback/complaint submission flow.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- API server dev mode runs `build` then `start` (no hot-reload; restart the workflow after backend changes)
- `DATABASE_URL` is not set yet — DB-touching code will fail until a Postgres database is added
- Port 18359 (Expo Metro) maps to external port 3000 in Replit's proxy config

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for Expo/React Native patterns used in this project
