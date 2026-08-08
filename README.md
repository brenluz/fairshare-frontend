# FairShare — Frontend

> Split expenses with friends and settle up in the fewest payments possible.

The web client for **FairShare**, an expense-splitting app. A mobile-first Angular single-page app that talks to the [FairShare backend](https://github.com/brenluz/FairShare) over JSON REST with JWT auth.

<p>
  <img alt="Angular 22" src="https://img.shields.io/badge/Angular-22-DD0031">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6.0-3178C6">
  <img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind%20CSS-4-38BDF8">
  <img alt="Vitest" src="https://img.shields.io/badge/tests-Vitest-6E9F18">
</p>

**Repos:** [Frontend](https://github.com/brenluz/fairshare-frontend) (this repo) · [Backend](https://github.com/brenluz/FairShare)

---

## What it does

- **Auth** — register / log in; the JWT is stored client-side and attached to every request
- **Groups** — create groups, see them with live balances, filter by all / active / settled
- **Invites** — share a group via a native share sheet or copy link; join from a pasted invite link
- **Expenses** — add an expense with equal, exact, or percentage splits
- **Settle up** — settle a whole group or an individual activity item
- **Activity feed** — a header bell with an unread badge, driven by the backend's notifications

---

## Tech stack

| | |
|---|---|
| Framework | Angular 22 (**standalone components only**, no NgModules) |
| Language | TypeScript |
| State | Angular signals |
| Styling | Tailwind CSS 4 (via PostCSS) |
| HTTP | `HttpClient` + a JWT auth interceptor |
| Tests | Vitest (Angular test runner) |
| Package manager | pnpm |

---

## Getting started

### Prerequisites
- Node.js 20+ (developed on 24.18.0)
- pnpm
- The [backend](https://github.com/brenluz/FairShare) running at `http://localhost:8080`

### Run it

```bash
pnpm install
pnpm start          # dev server at http://localhost:4200
```

The app expects the backend on `http://localhost:8080` — start it (ideally with its `dev` profile, which seeds a demo account) before logging in.

**Demo login** (seeded by the backend's `dev` profile):

| Email | Password |
|---|---|
| `demo@fairshare.com` | `password` |

### Other scripts

```bash
pnpm build          # production build to dist/
pnpm watch          # dev build in watch mode
pnpm test           # unit tests (Vitest)
```

Run a single test file:

```bash
ng test --include='**/some.spec.ts'
```

---

## Project structure

```
src/app/
├── pages/           # Route components
│   ├── login/
│   ├── register/
│   ├── groups/          # Group list (home) + notifications panel
│   ├── group-detail/    # Members, expenses, balances, settle, invite
│   └── join-group/      # Invite-link join flow
├── services/        # AuthService + API services (groups, notifications)
├── models/          # TypeScript interfaces matching the API contract
├── guards/          # authGuard — gates authenticated routes
├── interceptors/    # Attaches the JWT Authorization header
└── shared/          # API base URL, error/avatar/money helpers, logo
```

### Routes

| Path | Screen | Auth |
|---|---|---|
| `/login`, `/register` | Auth | Public |
| `/groups/join/:token` | Join via invite (sign-in first if needed) | Public |
| `/groups` | Group list — home after login | Required |
| `/groups/:id` | Group detail | Required |

---

## Configuration

The backend URL lives in [`src/app/shared/api.ts`](src/app/shared/api.ts):

```ts
export const API_BASE = 'http://localhost:8080/api';
```

Point it at a deployed backend when hosting the app. All other endpoints require a bearer token, which the [auth interceptor](src/app/interceptors/auth.interceptor.ts) adds automatically.

---

## Backend

This is only the web client. The REST API, database, debt-simplification engine, Redis cache, and Kafka activity feed live in the **[FairShare backend repo](https://github.com/brenluz/FairShare)** — see its README for the full API contract and how to run the stack.
