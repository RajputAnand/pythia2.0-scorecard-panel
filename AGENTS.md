<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-conventions -->
# Project Conventions

## Styling — Tailwind CSS v4
- **Use Tailwind utility classes directly in `.tsx` files by default.**
- Use CSS Modules with `@apply` sparingly — only for genuine reuse/abstraction: shared button variants used across multiple pages, `@keyframes` animations, `::before`/`::after` pseudo-elements, and complex selectors that can't be expressed inline (`:nth-child`, descendant rules like `strong` inside dynamic JSX content).
- CSS Module files that use `@apply` must start with `@reference "../../app/globals.css";` (adjust relative path per depth).
- Design tokens (`bg-canvas`, `text-accent`, `border-border`, etc.) are defined in `src/app/globals.css` under `@theme inline` and work as Tailwind utility classes directly in TSX — no `@reference` needed there.

## Component Structure
- **Split every HTML page into components** — each distinct section becomes its own component.
- Components live in `src/components/<ComponentName>/` with `<ComponentName>.tsx` + `<ComponentName>.module.css`.
- `page.tsx` is a clean assembler only — it imports components and arranges them. No inline JSX content.
- `page.module.css` contains only layout/spacing for the page shell (`.content`, `.twoCol`, etc.).
- Client components (needing `useState`, `useEffect`, etc.) go in `src/components/` too — not co-located in the route folder.

## Header Buttons
- The `Header` component accepts page-specific action buttons via `children`.
- Button styles are defined in `Header.module.css` and imported by each page:
  - `headerStyles.btnGhost` — bordered, secondary text
  - `headerStyles.btnAccent` — green background, white text
  - `headerStyles.btnPrimary` — dark (`bg-primary`) background, white text

## Role-Based Sidebar + User Identity
- All user/role data lives in `src/lib/demo-user.ts` — single source of truth.
- Change `DEMO_USER.role` to `'employee'`, `'owner'`, or `'manager'` to test different sidebar layouts and route access.
- `Sidebar.tsx` reads `DEMO_USER` and renders role-specific nav sections and bottom widget:
  - `employee` → "My Dashboard" nav + employee score pill
  - `manager` → "Manager Tools" nav + store pill (no view toggle)
  - `owner` → "Owner Tools" nav + owner/manager view toggle + store pill; toggling navigates to the default route for that view and swaps nav sections

## Role-Based Routing
- `src/proxy.ts` (Next.js 16 "Proxy" — replaces the deprecated `middleware.ts`) enforces role-based access on every request.
  - **Note:** Next.js 16 renamed `middleware.ts` → `proxy.ts` and `export function middleware` → `export function proxy`. Always use `proxy.ts` and the `proxy` export in this project.
- Visiting `/` redirects to the role's default page.
- Accessing a route outside a role's allowed prefixes also redirects to the default page.
- Role → allowed route prefixes → default route:
  | Role       | Allowed prefixes          | Default route                     |
  |------------|---------------------------|-----------------------------------|
  | `employee` | `/dashboard`              | `/dashboard/overview`             |
  | `owner`    | `/owner`, `/manager`      | `/owner/roi-attribution`          |
  | `manager`  | `/manager`                | `/manager/coaching-tracker`       |
- Owners can access `/manager/*` routes (they oversee managers); managers cannot access `/owner/*`.
- The proxy imports `DEMO_USER` from `src/lib/demo-user.ts` to read the role. Changing `DEMO_USER.role` immediately changes both routing and sidebar behavior.

## Shared Utilities
- Common, reusable functions with no coupling to a specific component go in `src/utils/common.ts` as named exports on the `Utils` class or as standalone exports.
- Do not duplicate utility logic across components — extract to `src/utils/common.ts` on first reuse.
- If shared logic relies on React APIs (e.g. `useState`, `useEffect`), first evaluate whether a Context is the right fit: a Context makes sense when the state/logic is genuinely shared across many components in the tree and doesn't belong to one owner. If the logic is only incidentally duplicated or the coupling would be forced, keep it local or extract a plain utility instead. When Context is the right call, add it under `src/context/`.
  - **Example:** `src/context/ToastContext.tsx` — manages toast visibility and message via `useState`; any component calls `useToast()` to trigger a toast without prop-drilling or duplicating the state.

## Types
- All TypeScript interfaces and types go in `src/types/` — never define them inline in component files.
- Use an appropriate filename per domain (e.g. `src/types/shift.ts`, `src/types/coaching.ts`). Append to an existing file if the type belongs to the same domain; create a new file only when the domain is clearly distinct.

## Demo Data
- All hardcoded demo/seed data goes in `src/lib/` as a named export constant (e.g. `SHIFT_SUMMARY_DATA` in `src/lib/shift-data.ts`).
- Components receive data via props — no inline data literals in component files, and no direct `src/lib/` imports inside components when data comes from a page-level API fetch (see Server Component Data Fetching below).

## Server Component Data Fetching
- When a page needs to pre-fetch data before rendering, `page.tsx` is an `async` Server Component that `await`s the API call and passes results down as props.
- The page-level fetch uses a fake API helper from `src/mock/<domain>APIs.ts` (e.g. `fakeGetOverview()`). Swap for a real `fetch` when the backend is ready — nothing else changes.
- The combined return type for a page fetch lives in `src/types/<page>.ts` (e.g. `src/types/overview.ts` → `OverviewPageData`).
- Components that receive server-fetched data accept typed props and do **not** import from `src/lib/` directly. They may still use `useState` / `useEffect` for purely local UI state (e.g. open/close toggles) — mark them `'use client'` only if they need browser APIs or hooks.
- Components that manage their own async lifecycle (e.g. Zustand stores with `useEffect` fetches) are exempt from this pattern and continue using the Zustand async action pattern.
- ISR (`revalidate`) may be added to `page.tsx` in the future — keep the async pattern compatible by not mixing server fetches with client-only code inside the page file.
- **Example:** `src/app/dashboard/overview/page.tsx` — `async` page calls `fakeGetOverview()`, receives `OverviewPageData`, and passes slices to `HeroBanner`, `ShiftSummary`, `CoachingMoments`, `ProgressChart`, and `Leaderboard` as props. `SwagStore` manages its own data via Zustand and is passed no props.

## Shared Components
- When two or more components share a non-trivial piece of UI (e.g. a reusable SVG chart, a card shell, a data table), extract it into its own component under `src/components/shared/<SharedComponentName>/`.
- The shared component receives all variable content via props — it must not import any page-specific data or types directly.
- Define the props interface in `src/types/` using a domain-appropriate filename (e.g. `src/types/line-chart.ts` for a line chart component).
- The consuming components each own their own data file in `src/lib/` and pass it through `useState` as usual — the shared component only renders what it receives.
- **Example:** `src/components/shared/LineChartSvg/LineChartSvg.tsx` — renders a multi-series SVG line chart; used by both `ProgressChart` and `ScoreVsTransactions`, each supplying its own data via `LineChartSvgProps`.

## State Management — Zustand
- Zustand stores live in `src/store/` as individual files named after their domain (e.g. `src/store/swagStore.ts`).
- Each store file exports a single `use<Domain>Store` hook created with `create<State>(...)`.
- Define the state shape and all actions together in one `interface` — never split them.
- Actions mutate state via `set((state) => ({ ... }))`. Return the same `state` object unchanged for no-op cases (e.g. guard clauses).
- Selectors: consume individual slices with `useStore((s) => s.field)` rather than subscribing to the whole store, to avoid unnecessary re-renders.
- Zustand is the right choice when state needs to be shared across unrelated components or when it outlives a single component's lifetime. For state that is purely local to one component, keep using `useState`. For state shared only within a React subtree, prefer Context.

### Async action pattern
Every store that talks to an API follows this shape:
```ts
interface DomainState {
  // data
  loading: boolean        // true while initial fetch is in flight
  redeemingId: string | null  // or similar per-item in-flight marker
  error: string | null    // last API error, null when clear

  fetchX: () => Promise<void>          // GET — called on mount via useEffect
  mutateX: (args) => Promise<boolean>  // POST/PATCH — returns true on success
}
```
- Fake API helpers (`fakeGet` / `fakePost`) live in `src/mock/<domain>APIs.ts` — never inline them in the store. Swap them for real `fetch` calls when the backend is ready.
- `mutateX` returns `boolean` so the component can react (e.g. show a toast) without the store knowing about UI.
- While a mutation is in-flight, set `redeemingId` (or equivalent) to the item's ID and disable all other action buttons to prevent double-submits.
- **Example:** `src/store/swagStore.ts` — `fetchPoints` (GET on mount), `redeem` (POST per item); `SwagStore.tsx` drives all three states: `loading` pulse, per-button `redeemingId` spinner, `error` banner.

## Mock API Layer
- All fake/mock API functions live in `src/mock/` — one file per domain, named `<domain>APIs.ts` (e.g. `src/mock/swagStoreAPIs.ts`).
- Mock files are the **only** place where `setTimeout`-based fake network delays live. Never inline fake delays in stores or components.
- Mock functions pull their seed data from `src/lib/` — reuse an existing data file if one exists, create a new one if not. Never hardcode data literals inside mock files.
- Each mock function mirrors the real API contract it will eventually replace: same function name, same parameter shape, same return type. Swapping to a real `fetch` call means replacing only the mock file, nothing else.
- **Example:** `src/mock/swagStoreAPIs.ts` — exports `fakeGet` (returns points + catalog from `SWAG_STORE`) and `fakePost` (simulates a redeem with a 15% failure rate); imported by `src/store/swagStore.ts`.

## Routes
- Pages are organized by role under three route groups:
  - `src/app/dashboard/` — employee pages: `overview`, `progress`, `coaching`, `leaderboard`, `swag`
  - `src/app/owner/` — owner pages: `roi-attribution`, `benchmarking`, `marketing-loop`
  - `src/app/manager/` — manager pages: `coaching-tracker`, `staffing-intelligence`
- Each group has its own `layout.tsx` that renders `<Sidebar />`.
- The employee overview page is at `/dashboard/overview` — not at `/`.
<!-- END:project-conventions -->
