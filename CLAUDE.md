# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm start` / `ng serve` — dev server at `http://localhost:4200`
- `pnpm build` / `ng build` — production build to `dist/`
- `pnpm watch` / `ng build --watch --configuration development` — dev build in watch mode
- `pnpm test` / `ng test` — unit tests via the Vitest-based Angular test runner
  - Run a single test file: `ng test --include='**/some.spec.ts'`
- `ng generate component path/to/name` — scaffold a new standalone component

## Architecture

This is an Angular 22 app using **standalone components only** — no NgModules anywhere. Routing and app-wide providers are configured in `src/app/app.config.ts` (via `ApplicationConfig`/`provideRouter`) and `src/app/app.routes.ts`.

The app is the frontend for **FairShare**, an expense-splitting app. The backend is a separate, already-complete service running at `http://localhost:8080`, consumed entirely over JSON REST with JWT bearer auth.

### Backend API contract

Auth (public, no token required):
- `POST /api/auth/register` — body `{ username, email, password }` → `{ token, email, username }`
- `POST /api/auth/login` — body `{ email, password }` → `{ token, email, username }`

All other endpoints require `Authorization: Bearer <token>`. The JWT subject is the user's email; the backend derives the current user from the token, so the frontend never sends a user id explicitly.

Groups:
- `POST /api/groups` — body `{ name, description }` → group detail, 201
- `GET /api/groups` → `[{ id, name, memberCount }]`
- `GET /api/groups/{id}` → `{ id, name, description, createdAt, createdBy: {id,username,email}, members: [{id,username,email}] }`
- `GET /api/groups/{id}/invite` → invite link as plain text (members only)
- `POST /api/groups/join/{token}` → joins group, returns group detail

Expenses:
- `POST /api/groups/{id}/expenses` — body `{ description, amount, splitType, splits }`, 201
  - `splitType`: `"EQUAL" | "PERCENTAGE" | "EXACT"`
  - `splits`: `null` for `EQUAL`, or `[{ userId, value }]` for `PERCENTAGE` (percentages) / `EXACT` (amounts)
- `GET /api/groups/{id}/expenses` → `[{ id, description, amount, splitType, paidBy, createdAt, splits: [{ user, owedAmount }] }]`

Settlements:
- `GET /api/groups/{id}/balances` → `[{ user: {id,username,email}, balance }]` (positive = owed money, negative = owes)
- `GET /api/groups/{id}/simplify` → `[{ from, to, amount }]` (minimal transactions to settle up)
- `POST /api/groups/{id}/settle` — body `{ payerId, payeeId, amount }` → records that payerId paid payeeId. The caller must be one of the two parties. Settlements reduce the computed balances.

### Planned frontend structure

- `src/app/services/` — `AuthService` and API services (groups, expenses, settlements), all using `HttpClient`
- `src/app/models/` — TypeScript interfaces matching the API contract above
- `src/app/guards/` — route guard(s) gating authenticated routes
- `src/app/interceptors/` — HTTP interceptor that attaches the JWT `Authorization` header to outgoing requests
- Pages: `/login`, `/register`, `/groups` (group list, home after login), `/groups/:id` (group detail: members, expenses, balances, simplified debts, add-expense form, settle-up, invite link), `/groups/join/:token` (join flow, redirects to login first if unauthenticated)

## Working style

Build incrementally, one piece at a time — don't scaffold multiple pages/services in a single pass. Let the user write and review code themselves; explain concepts and point out mistakes rather than generating large files unprompted.
