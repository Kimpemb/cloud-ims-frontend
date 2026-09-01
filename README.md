# Cloud IMS — Frontend (Phase 8)

Next.js 14 (App Router, TypeScript, Tailwind) frontend for the [cloud-ims](https://github.com/Kimpemb/cloud-ims) backend. Built directly against the real controllers/DTOs in the `spring-migration` branch, not just MVP.md.

## Run it

```bash
npm install
npm run dev
```

Opens on `http://localhost:3000`. By default it talks to the live backend at `http://16.170.244.112:8080` — no setup needed. If that IP changes (see the Elastic IP note in the Sept 1 handoff) or you're pointing at localhost:8080 instead, copy `.env.local.example` to `.env.local` and set `BACKEND_URL`.

## Why there's a proxy (important)

`SecurityConfig.java` in the backend has no `CorsConfigurationSource` bean. A browser calling `16.170.244.112:8080` directly from a Next.js app running on a different origin, with the session cookie the backend relies on for auth, will get blocked by CORS — this isn't a frontend bug, it's a gap on the backend side.

Rather than requiring a backend change, `next.config.js` proxies every `/api/*` request server-side to the real backend (`rewrites()`). The browser only ever talks to this app's own origin, so it's same-origin from the browser's perspective and the session cookie round-trips normally. All frontend code calls relative paths like `/api/products`, never the EC2 URL directly.

**If you'd rather fix it properly on the backend instead:** add a `CorsConfigurationSource` bean allowing your frontend's origin with `allowCredentials(true)`, and switch the fetch calls in `lib/api.ts` to hit `BACKEND_URL` directly. The proxy approach here was chosen specifically to avoid touching the already-tested, already-deployed backend.

## What's implemented (Phase 8 scope, per PHASES.md §40 / MVP.md)

**Seller dashboard** (`/dashboard/*`, session-authenticated):
- Login / register (`/login`, `/register`)
- Inventory: list, add, edit, delete, image upload (`/dashboard/products/*`)
- Orders: list, status updates respecting the backend's state machine (`/dashboard/orders`)

**Public storefront** (`/store/[username]/*`, no auth):
- Seller profile + searchable, filterable product grid
- Product detail page with guest checkout (name + contact, no buyer account — matches the "no buyer accounts in MVP" decision in MVP.md)

## Things worth knowing about the auth model

- The backend has **no `GET /api/auth/me`**. There's no way to ask the server "who is logged in" on page load — only `/login` and `/register` return a profile, and only `/login` actually creates a session.
- This app caches that profile in `localStorage` (`lib/auth.ts`) purely for display (name in the sidebar). It is **not** the source of truth for whether you're actually logged in — any dashboard API call that comes back `401`/`403` is treated as "session's gone," clears the cache, and bounces to `/login`. This mirrors the stale-cookie gotcha in `SESSION_HANDOFF_2026-09-01_PHASE9.md` §2.1.
- `POST /api/auth/register` does **not** log you in (confirmed in `AuthService.java` — no session is created). Registration redirects to `/login`, it doesn't skip it.

## Order status actions

`OrderStatus` transitions are enforced server-side (confirmed by the live test in the Sept 1 handoff: `CONFIRMED → PENDING` is rejected with a 409). The orders page only renders the buttons for moves the backend actually allows from each status (`lib/types.ts` → `NEXT_ORDER_STATUSES`). The backend is still the real authority — a stale button click still just gets a clean 409 back, surfaced inline.

## Design notes

Visual identity is a "resale ledger" — hairline-rule rows instead of shadowed cards, a serif display face (Fraunces) for headings, a grotesk sans (Archivo) for UI, and a monospace (IBM Plex Mono) for prices and tags, echoing a price tag / consignment ledger rather than a generic SaaS dashboard. Tokens live in `tailwind.config.ts` and `app/globals.css`.

## Known gaps / things to true up against the live server

- **Filters** (brand/size/condition) on the storefront are applied client-side, because `GET /api/store/{username}/products` only accepts a `search` query param server-side (see `StorefrontController.java`) — there's no `brand=`/`size=` filter on the backend yet. Fine for a single seller's catalog size; would need a backend change to scale.
- Image `<img>` tags are used instead of `next/image`, deliberately — S3 URLs are dynamic per upload and not worth pre-configuring `remotePatterns` for an MVP.
- Prices are displayed in GH₵ (matches MVP.md's worked examples). The backend has no currency field — this is a display-only choice in `lib/format.ts`, change it in one place if that's wrong.
