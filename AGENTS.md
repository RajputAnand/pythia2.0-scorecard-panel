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

## Authentication
- Auth is handled by **next-auth v5** (Auth.js). Config lives in `src/auth.ts` — exports `{ handlers, signIn, signOut, auth }`.
- Demo credentials are defined in `src/lib/demo-user.ts` as `DEMO_USERS` — one entry per role with `email` and `password` only (no store data — store selection is hardcoded, see **Store data flow** under **Role-Based Sidebar**).
- Demo accounts:
  | Role     | Email                | Password   |
  |----------|----------------------|------------|
  | employee | employee@demo.com    | demo1234   |
  | manager  | manager@demo.com     | demo1234   |
  | owner    | owner@demo.com       | demo1234   |
- The JWT callback stores auth-only fields in the token; the session callback surfaces them on `session.user`.
- **Session shape** — only these fields are stored in the JWT/session: `role`, `initials`, `token` (API bearer token, aliased as `pythia2Token`), `refreshToken`, `score`, `jobTitle`, `points`. Store data is **not** in the session — `userStore` seeds it from a hardcoded constant, not the API (see **Store data flow** under **Role-Based Sidebar**). `refreshToken` is what `api-client.ts`'s response interceptor sends to `POST /auth/refresh` on a 401 — see **HTTP Client — Axios** below.
- next-auth type augmentations live in `src/types/next-auth.d.ts` — extends `Session`, `User`, and `JWT` with the auth-only fields above.
- `NEXTAUTH_SECRET` must be set in `.env.local`.
- **`SessionProvider`** is mounted in the root layout (`src/providers/SessionProvider.tsx`) so that `useSession()` works in all client components.

## Server Actions
- Server actions live in `src/actions/` as `'use server'` files, one file per domain (e.g. `src/actions/auth.ts`).
- They are the required bridge between `'use client'` components and server-side logic. A file cannot mix `'use client'` and `'use server'` — so any client component that needs to call `signIn`, `signOut`, or mutate server state must import a server action.
- Client components wire actions via `useActionState(action, initialState)` — the action receives `(prevState, formData)` and returns the next state (e.g. an error string, or `undefined` on success).
- **Example:** `LoginForm.tsx` is `'use client'` and cannot call `signIn` directly. It imports `login` from `src/actions/auth.ts` and passes it to `useActionState`.
- **Login action is auth-only.** `src/actions/auth.ts → login()` only POSTs credentials and calls `signIn` with the auth fields (`id`, `email`, `name`, `role`, `token`, `initials`, `score`, `jobTitle`). It does not touch stores — store data isn't fetched at all, see **Store data flow** under **Role-Based Sidebar**.

## Role-Based Sidebar + User Identity
- User identity comes from the **session**, not a static constant.
- `Sidebar.tsx` accepts a `user: User` prop — layouts call `await auth()` to get the session and pass `session.user` down.
- `Sidebar.tsx` renders role-specific nav sections and bottom widget:
  - `employee` → "My Dashboard" nav + employee score pill
  - `manager` → "Manager Tools" nav + store pill (no view toggle)
  - `owner` → "Owner Tools" nav + owner/manager view toggle + store pill; toggling navigates to the default route for that view and swaps nav sections
- The store pill (`storeName`, `location`) in the Sidebar comes from **`useUserStore(s => s.currentStore)`** (Zustand), not from the session. Do not read store display data from `user` props.
- The employee score in the Sidebar bottom widget uses **`useUserStore(s => s.currentScore)`** with a fallback to `user.score` from the session (`currentScore ?? user.score`). `currentScore` is populated by `OverviewContent` when the dashboard summary loads; before that, the session score is shown.
- `Header.tsx` does **not** accept a `user` prop. It calls `useSession()` directly to read the token and role. Pages must not pass `user` to `<Header>`.
- **Header store selector** — renders for `owner`, `manager`, and `superadmin` roles (not employee). Condition: `(role === 'owner' || role === 'manager' || role === 'superadmin') && stores.length > 0`. Do not restrict it to `owner` only.
- **Store data flow (currently hardcoded)** — the legacy stores endpoint no longer accepts a token from the unified auth backend, so `userStore`'s `stores` list is seeded directly from the static `STORES` constant in `src/lib/store-data.ts` (currently a single demo store) rather than fetched. `Header` reads `stores`/`currentStore` straight off `useUserStore()` — it does not fetch anything. `setStores(stores)` still exists on the store for when a real endpoint returns, but nothing calls it today.
- **Swag points** — `userStore` also holds `points: number | null`. `Sidebar` seeds it from the session (`user.points`) via a `useEffect` on mount; `swagStore.redeemItem()` optimistically decrements it (rolling back on failure) via `useUserStore.getState().setPoints(...)`.

## Role-Based Routing
- `src/proxy.ts` (Next.js 16 "Proxy" — replaces the deprecated `middleware.ts`) enforces auth and role-based access on every request.
  - **Note:** Next.js 16 renamed `middleware.ts` → `proxy.ts` and `export function middleware` → `export function proxy`. Always use `proxy.ts` and the `proxy` export in this project.
- The proxy is wrapped with `auth()` from next-auth — `req.auth` holds the session.
- Unauthenticated requests are redirected to `/login`; `/login` is always public.
- Authenticated requests to `/` or `/login` redirect to the role's default page.
- Accessing a route outside a role's allowed prefixes redirects to the default page.
- Role → allowed route prefixes → default route:
  | Role       | Allowed prefixes          | Default route                     |
  |------------|---------------------------|-----------------------------------|
  | `employee`   | `/dashboard`              | `/dashboard/overview`             |
  | `owner`      | `/owner`, `/manager`      | `/owner/roi-attribution`          |
  | `manager`    | `/manager`                | `/manager/coaching-tracker`       |
  | `superadmin` | `/super-admin`            | `/super-admin/kpi-visibility`     |
- Owners can access `/manager/*` routes (they oversee managers); managers cannot access `/owner/*`.
- Super Admin's read-only manager/employee mirror pages (`/super-admin/manager/*`, `/super-admin/employee/*`, see **Super Admin — Manager/Employee Live Views** below) live under the `/super-admin` prefix, so no proxy change was needed to expose them — they're not real `/manager/*` or `/dashboard/*` routes.
- `src/utils/routes.ts` also exports `ROLE_LOGIN_ROUTES` (`employee` → `/login/employee`, `owner` → `/login/owner`, `manager` → `/login/manager`) alongside `ROLE_DEFAULT_ROUTES`. Used by `api-client.ts`'s 401 handler to send an expired session back to the correct role's login page instead of a generic one.

## Super Admin — KPI Visibility System
- A fourth role, `superadmin`, exists solely to manage what's visible to everyone else. It authenticates against the real backend exactly like the other three roles (`src/actions/auth.ts → login()` has no special-casing for it) — there's a seeded backend account (`scripts/seed_super_admin.py` in `pythia-2.0`) gated by `require_super_admin` (`role_type == "global"`, `role_name == "superadmin"`).
- The whole system lives behind `/super-admin/kpi-visibility` (`KpiVisibilityPanel.tsx`), which lets the super admin drill down Role → Page → individual KPI/graph and toggle each on/off, plus toggle a whole **page** off (which removes it from that role's Sidebar entirely).
- **Registry — `src/lib/admin-config-data.ts`:**
  - `KPI_IDS` — flat map of stable string ids for every individual toggle-able card/graph/panel. Import ids from here, never hardcode the string.
  - `KPI_REGISTRY: KpiRegistryEntry[]` — one entry per id: `{ id, label, description, type: 'card'|'graph'|'panel', role, page, pageHref }`.
  - `PAGE_IDS` / `PAGE_REGISTRY` — the coarser "show this whole page in the sidebar" toggle, one per sidebar-navigable page. `PAGE_ID_BY_HREF` maps a Sidebar nav item's `href` to its page-level id. `ROLE_BY_FIELD_ID` maps any `KPI_REGISTRY`/`PAGE_REGISTRY` id back to its owning `AdminRole`.
  - Visibility state for **both** registries lives in one flat map (`Record<string, boolean>`) in `src/store/adminConfigStore.ts`, backed by `src/queries/admin-config.ts` (`fetchFieldConfigs`/`updateFieldConfig`, real `pythia2Client` calls to the backend's `GET`/`PUT /super-admin/field-config[/{role}]`) per the standard **Async action pattern**. `GET /super-admin/field-config` is readable by any authenticated role (not just Super Admin) — `Sidebar.tsx` calls the same `fetchVisibility` action with its own `user.token` prop so every role can filter its own nav by the admin-configured page toggles; only `PUT` (editing) stays Super-Admin-gated. The backend's `ui_field_config` collection stores one document per role (`employee`/`manager`/`owner`) whose `fields` dict is a superset containing every `KPI_REGISTRY`/`PAGE_REGISTRY` id for that role — seeded/kept in sync via `pythia-2.0/scripts/seed_field_configs.py` (merge-only: re-running it never clobbers a toggle already saved). Since the backend `PUT` replaces a role's whole `fields` dict, the store also keeps `fieldsByRole` so a single-id toggle can be merged into the rest of that role's current fields before sending. Any component reads its own flag with `useAdminConfigStore(s => s.visibility[KPI_IDS.xxx] ?? true)` — default **true** so nothing new silently disappears. `fetchVisibility`/`setCardVisibility` both take the caller's bearer token as an explicit argument since they're client Zustand actions, not server actions — `KpiVisibilityPanel.tsx` sources it from `useSession().data?.user?.token`, `Sidebar.tsx` from its `user` prop.
  - **Registering a new KPI/page**: add it to `KPI_REGISTRY`/`PAGE_REGISTRY` as usual, and also add the matching `(field_id, role)` entry to `pythia-2.0/scripts/seed_field_configs.py`, then re-run that script so the id shows up explicitly in the backend doc (and in the Super Admin panel's toggle list via `GET /super-admin/field-config`). It still defaults to visible via the `?? true` fallback even before the script runs — the script just makes the stored default explicit rather than implicit.
- **Wiring a real component to its toggle** — two patterns, matching how its cards are structured:
  - **Coarse** (the component is one cohesive visual — a hero banner, a chart, a table): `const visible = useAdminConfigStore(...); if (!previewMode && !visible) return null` at the top of the component.
  - **Fine-grained** (the component already builds an internal array of N independent cards, e.g. a 4-card KPI strip): filter the array by `visibility[card.id] ?? true` before mapping, and switch the grid from a fixed `grid-cols-N` to `style={{ gridTemplateColumns: \`repeat(${cards.length}, 1fr)\` }}` so it reflows cleanly when fewer are visible.
  - Every wired component also accepts an optional **`previewMode?: boolean`** prop that bypasses its own visibility check (so the admin panel can preview a currently-hidden item) and, for fine-grained ones, an optional **`highlightId?: string`** that dims every card except the one matching it (used when hovering a single row in the panel that maps to one card within a shared strip).
  - Preview instances (with realistic sample data instead of live/placeholder data) are registered in `src/components/KpiVisibilityPanel/kpiPreviews.tsx` (`getKpiPreview(id)`), sourcing fake data from `src/lib/kpi-preview-data.ts`.
- **Sidebar enforcement** — `Sidebar.tsx` reads `PAGE_ID_BY_HREF` + the same `useAdminConfigStore` visibility map (fetched via its own `user.token`, see above) and filters out any nav item (and any section left empty as a result) whose page has been toggled off.
- **Route-level enforcement (`src/proxy.ts`)** — a page-level toggle is also enforced at the proxy, not just in the Sidebar: `PAGE_HREF_TO_FIELD_ID` (built from `PAGE_REGISTRY`) maps the request's `pathname` to its field id, and if that pathname is one of the 7 registered pages, the proxy calls `GET /super-admin/field-config` with the caller's own token and redirects to the role's default route when the field is explicitly `false`. This closes the gap where disabling a page only hid its sidebar link — a determined user could still reach it by typing the URL directly. Fails open (treats a fetch error the same as "visible") to match the client's own `?? true` default, and is skipped when `pathname === defaultRoute` to avoid redirecting a hidden default route to itself in a loop. Only the 7 `PAGE_REGISTRY` pages are checked — `Employees`/`Unknown Identities`-style pages with no page-level toggle are unaffected, same as in the Sidebar.
- **Convention: register new UI as part of building it, not after.** Whenever you add a new sidebar nav item, KPI card, graph, or panel anywhere in the app, add its entry to `KPI_REGISTRY` (and `PAGE_REGISTRY` if it's a new sidebar-navigable page) **in the same change**, defaulting to visible (the mock API seeds every registry id to `true`, and every `?? true` fallback assumes this — never seed a new entry as hidden by default). Wire the real component with the coarse or fine-grained pattern above, and add a preview entry in `kpiPreviews.tsx`. Treat an unregistered card/page as an incomplete implementation, not an optional follow-up — this now also includes `proxy.ts`'s route-level gate, since it derives from the same `PAGE_REGISTRY`.

## Super Admin — Manager/Employee/Owner Live Views
- Separate from the KPI Visibility config tool above, Super Admin also gets read-only mirrors of every Manager page, every Owner page, and the Employee Overview page, under `SUPERADMIN_NAV`'s **Manager View**, **Owner View**, and **Employee View** sections in `Sidebar.tsx`.
- **Manager mirrors** — `src/app/super-admin/manager/{dashboard,employees,coaching-tracker,staffing-intelligence,unknown-identities}/page.tsx` are near-verbatim copies of the corresponding `src/app/manager/*/page.tsx`: same queries, same components, same `session.user.pythia2Token` fetch pattern (just called with the super admin's own token instead of a manager's). There's no per-manager/per-store picker yet — it renders whatever the backend returns for the authenticated super admin. Keep these in sync by hand if the manager page they mirror changes; there's no shared source file to update once. None of these pages pass `previewMode` to the manager KPI components they render, so each one's own `useAdminConfigStore` visibility check still applies — a manager KPI toggled off by Super Admin stays hidden in this mirror too.
- **Owner mirrors** — `src/app/super-admin/owner/{roi-attribution,benchmarking,marketing-loop}/page.tsx` are near-verbatim copies of `src/app/owner/*/page.tsx`. Unlike the manager pages, the owner pages don't fetch anything at the page level at all — every owner component (`RoiHero`, `ScoreVsTransactions`, `NetworkLeaderboard`, `MarketingInsightStrip`, etc.) is self-contained, sourcing its own mock data from `src/lib/`. Same rule as the manager mirrors: no `previewMode` is passed, so each component's own `useAdminConfigStore` visibility check still applies.
- **Employee mirror — Overview only** — `src/app/super-admin/employee/overview/page.tsx` is the *only* employee mirror; Progress/Coaching/Leaderboard/Swag standalone pages were intentionally removed (their content — `ProgressChart`, `CoachingMoments`, `Leaderboard`, `SwagStore` — already all appear together on the Overview mirror, same as the real employee Overview page). It's intentionally **static**, not live: employee pages fetch data scoped to the logged-in employee's own session, and there's no "view employee X's data" backend capability yet. It renders the real employee-facing components (`HeroBanner`, `ProgressChart`, `Leaderboard`, `CoachingMoments`, `SwagStore`) with sample data from `src/lib/kpi-preview-data.ts` (`PREVIEW_HERO_BANNER_DATA`, `PREVIEW_WEEKLY_STATS`, `PREVIEW_PROGRESS_DATA`, `PREVIEW_TEAM_RANKING`, `PREVIEW_COACHING_MOMENTS`) — the same sample-data convention `kpiPreviews.tsx` already uses for hover previews, just assembled into a full page instead of individual card previews.
  - Unlike `kpiPreviews.tsx`, this page **deliberately doesn't pass `previewMode`** to `CoachingMoments`/`Leaderboard`/`ProgressChart` — `previewMode` bypasses a component's own visibility check, which is correct for the admin panel's "preview a hidden card" hover but wrong for a live mirror: a KPI toggled off should stay hidden here too. `SwagStore` is the one exception, since its `previewMode` also swaps in a static catalog instead of issuing a real fetch — it keeps `previewMode` but is wrapped in `KpiVisibilityGate` (`src/components/shared/KpiVisibilityGate/KpiVisibilityGate.tsx`) so the toggle is still respected.
  - If Progress/Coaching/Leaderboard/Swag mirror pages are ever reinstated, follow the same no-`previewMode` (or `KpiVisibilityGate`-wrapped) pattern — don't reintroduce the bypassed-visibility version.
- All three sets of routes live under the `/super-admin` prefix, so `proxy.ts`'s existing `superadmin: ['/super-admin']` allow-list already covers them — no proxy change needed.
- **Page-level toggles apply too** — `SUPERADMIN_NAV`'s Manager View / Owner View / Employee View nav items set `mirrorsHref` (e.g. `/super-admin/manager/dashboard` → `mirrorsHref: '/manager/dashboard'`) so `Sidebar.tsx`'s existing `PAGE_ID_BY_HREF` filter checks the *mirrored* page's visibility, not the `/super-admin/...` route itself (which isn't in `PAGE_REGISTRY`). If a manager/owner/employee page is toggled off entirely, its Super Admin mirror nav item disappears from the sidebar the same way it disappears from that role's own sidebar. `manager/dashboard`, `manager/coaching-tracker`, `manager/staffing-intelligence`, `employee/overview`, and all three owner pages (`owner/roi-attribution`, `owner/benchmarking`, `owner/marketing-loop`) have `mirrorsHref`; `manager/employees` and `manager/unknown-identities` don't — they have no page-level toggle in `PAGE_REGISTRY` at all (same as their real counterparts), so they're always shown.
- Not registered in `KPI_REGISTRY`/`PAGE_REGISTRY` themselves — that system controls what `employee`/`manager`/`owner` see in their own Sidebar, and `AdminRole` doesn't include `superadmin`. These mirror pages are Super Admin's own internal views of other roles' panels; they *read* the same visibility state, they aren't independently toggleable.
- No real-time/live-refresh mechanism exists for any of this yet (no websockets/SSE/polling anywhere in the app) — every mirror page just fetches (or renders static sample data) once per page load, same as every other page in this project.
- **Backend dependency for Manager mirrors** — every manager-scoped endpoint these pages call needs to (a) let a global role (superadmin) through its role gate, and (b) treat superadmin's empty `store_ids` as "no restriction" rather than "zero stores" when building a store-scoped Mongo query — otherwise the mirror silently renders empty (query succeeds, matches nothing) or 403s outright. This is handled in `pythia-2.0` via two helpers in `app/dependencies.py`: `is_manager_or_above()` and `scoped_store_ids()` (returns `None` for a global role instead of `[]`, and every consuming query builder treats `None` as "omit the store filter"). Fixed so far: all of `employees.py` and `unknown_identities.py`'s role gates; `manager_dashboard.py`'s 3 endpoints; and the specific `manager_coaching.py` endpoints these mirror pages actually call end-to-end, including interactive drill-downs inside a mirrored component (e.g. `CoachingTrackerPanel`'s employee-detail click triggers `GET /manager-coaching/employees/{user_id}`, not just the two endpoints the page fetches on load) — `/summary`, `/employees`, `/employees/{user_id}`. **If a new manager component/interaction is added to one of these mirror pages, check whether the endpoint(s) it calls need the same `scoped_store_ids` treatment** — grep `pythia-2.0/app/routers/manager_coaching.py` for `_manager_store_ids` to see which endpoints in that router still haven't been converted (they don't need to be, unless something in the Super Admin mirror ends up calling them).

## HTTP Client — Axios

All real API calls go through the `pythia2Client` axios instance exported from `src/lib/api-client.ts`. Never use `fetch` directly in server actions or query functions.

```ts
import { pythia2Client } from '@/lib/api-client'
```

`pythia2Client` is built by `createClient()`, which attaches `Content-Type: application/json` plus:
- **Request interceptor** — currently a no-op. Session-based auth injection isn't wired centrally yet: pass the token per-call, `{ headers: { Authorization: \`Bearer ${token}\` } }`.
- **Response interceptor** — handles 401s from requests that carried a bearer token (a 401 from login/forgot-password/reset-password, which never send one, is passed through as-is — it's a normal wrong-credentials response, not session expiry):
  1. Client-side only, calls `POST /auth/refresh` with the session's `refreshToken` (concurrent 401s across widgets are coalesced into one in-flight refresh via a shared promise).
  2. On success, re-`signIn('credentials', { redirect: false })` with the refreshed token pair so the next-auth session cookie updates, then retries the original request once with the new access token.
  3. If there's no refresh token, the refresh call fails, or the retried request 401s again, it redirects to the expired user's role-specific login page (`ROLE_LOGIN_ROUTES[role]`, resolved via `getSession()` client-side / `auth()` server-side; falls back to `/login/employee` if the role can't be resolved at all). Server-side 401s (no refresh attempt possible mid-render) redirect immediately the same way.
- Axios throws on 4xx/5xx. Catch with `axios.isAxiosError(err)` to extract `err.response?.data?.message` before falling back to a generic message.

## API Endpoints

Endpoint paths (no base URL) live in `src/utils/api-endpoints.ts` as a single `PYTHIA_2_API` const — the app now talks to one unified backend, there is no `PYTHIA_1_API` anymore:

```ts
import { PYTHIA_2_API } from '@/utils/api-endpoints'
```

- Grouped by domain: `auth` (`login`, `refresh`, `forgotPassword`, `resetPassword`), `dashboard` (`summary`), `coaching` (`moments`), `employees` (`list`/`create`/`detail(userId)`/`credentials(userId)`), `unknownIdentities` (`list`/`count`/`trashed`/`assign(identityId)`/`trash(identityId)`/`restore(identityId)`), `managerCoaching` (`signals`/`signal(planId)`/`summary`/`effectiveness`/`employees`/`employeeDetail(userId)`), `managerDashboard` (`summary`/`leaderboard`/`trend`). Add new endpoints here as they are defined.
- There is no stores endpoint on the unified backend — store selection is hardcoded (see **Store data flow** under **Role-Based Sidebar** above).
- Always pair `PYTHIA_2_API` with `pythia2Client` (the only axios client — see **HTTP Client — Axios**).

## API Response Types

Canonical response envelopes live in `src/types/api.ts`:

```ts
interface ApiResponseV2<T> { success: boolean; message?: string; data: T }

// Paginated list endpoints (e.g. /employees, /unknown-identities)
interface ApiMeta { total: number; skip: number; limit: number }
interface ApiResponseV2Paginated<T> { success: boolean; message?: string; meta: ApiMeta; data: T }
```

Pass the type to the axios generic, e.g. `pythia2Client.get<ApiResponseV2Paginated<ApiEmployee[]>>(...)`, then check `response.data.success` for application-level success.

Raw API shapes (as returned by the backend before any mapping) live in domain type files under `src/types/` — e.g. `src/types/employee.ts` → `ApiEmployee`, `src/types/unknown-identity.ts` → `UnknownIdentity`.
- **`src/types/store.ts`** — `Store` is the raw stores-endpoint shape (`_id`, `name`, `storeNo`, `location`, `district`, `createdBy`, `updatedBy`, timestamps, `__v`) and is what `userStore` actually uses. There is a second, unrelated `Store` interface in `src/types/user.ts` (`id`/`name`/`location`/`nodesOnline`) that nothing imports — it's dead. Always import `Store` from `@/types/store`, not `@/types/user`.

## Shared Utilities
- Common, reusable functions with no coupling to a specific component go in `src/utils/common.ts` as named exports on the `Utils` class or as standalone exports.
- Do not duplicate utility logic across components — extract to `src/utils/common.ts` on first reuse.
- If shared logic relies on React APIs (e.g. `useState`, `useEffect`), first evaluate whether a Context is the right fit: a Context makes sense when the state/logic is genuinely shared across many components in the tree and doesn't belong to one owner. If the logic is only incidentally duplicated or the coupling would be forced, keep it local or extract a plain utility instead. When Context is the right call, add it under `src/context/`.
  - **Example:** `src/context/ToastContext.tsx` — manages toast visibility and message via `useState`; any component calls `useToast()` to trigger a toast without prop-drilling or duplicating the state.
- **Existing utilities in `src/utils/common.ts`:**
  - `extractApiErrorMessage(err, fallback)` — pulls a user-facing message out of a FastAPI error response (`detail` as a string for 401/400s, as a field-error array for 422s), falling back to `fallback` and logging otherwise. The standard `catch` handler for `pythia2Client` calls.
  - `renderText(text)` — splits a string on `**bold**` markers and returns React nodes.
  - `getWeekSubtitle(date)` / `formatWeekRange(weekStart, weekEnd)` — both return `"Week of MMM D – MMM D, YYYY"`; the first for the Mon–Sun week containing a `Date` (used by dashboard `page.tsx` files for the Header subtitle), the second for an API `week_start`/`week_end` ISO pair.
  - `getGreeting(date?)` — returns `"Good morning"`, `"Good afternoon"`, or `"Good evening"` based on the hour of `date` (defaults to `new Date()`). Used by `HeroBanner`.
  - `getS3AssetUrl(key)` — builds a URL under `NEXT_PUBLIC_S3_ASSET_BASE_URL` for an S3-backed asset key.
  - `getEmployeeName(employee)` / `getEmployeeInitials(employee)` — resolve display name/initials from `ApiEmployee`, tolerating both snake_case (`first_name`/`last_name`, from `POST /employees`) and camelCase (`firstName`/`lastName`, migrated from Pythia-1) field shapes.
  - `getInitialsFromDisplayName(name)` — initials from an already-formatted name (e.g. `"Marcus R."` → `"MR"`).
  - `formatNameList(names)` — Oxford-comma join: `"A"`, `"A and B"`, `"A, B, and C"`.
  - `getAvatarColor(seed)` — deterministically picks a color from a fixed palette for a stable id; pure UI styling, not derived data.

## Dashboard Page Date Convention
- All dashboard `page.tsx` files hold a `currentDate` variable that drives date-dependent display (week subtitle, greetings, etc.).
- It is currently hardcoded to `new Date(2026, 5, 14)` for demo/development purposes. Replace with `new Date()` in every page before shipping to production.

## Types
- All TypeScript interfaces and types go in `src/types/` — never define them inline in component files.
- Use an appropriate filename per domain (e.g. `src/types/shift.ts`, `src/types/coaching.ts`). Append to an existing file if the type belongs to the same domain; create a new file only when the domain is clearly distinct.

## Demo Data
- All hardcoded demo/seed data goes in `src/lib/` as a named export constant (e.g. `SHIFT_SUMMARY_DATA` in `src/lib/shift-data.ts`).
- Components receive data via props — no inline data literals in component files, and no direct `src/lib/` imports inside components when data comes from a page-level API fetch (see Server Component Data Fetching below).

## Server Component Data Fetching

**No TanStack Query / React Query in this project — do not reintroduce it.** All server-fetched data is handled with plain `async`/`await` and React state; there is no client-side cache library.

**Server-fetched data — props drilling (the only pattern for page-level fetches):**
- `page.tsx` is an `async` Server Component that `await`s the API call (via `pythia2Client` in a `src/queries/<domain>.ts` file, or a fake helper from `src/mock/<domain>APIs.ts` for still-mocked domains) and passes the result down as props.
- Now that the backend is served over HTTPS, server-side fetching is purely an optimization (no loading flash, one round trip during SSR) — not a workaround for anything. Client components are free to call `pythia2Client` directly too.
- Two fetch-orchestration patterns are both in use — pick per page:
  - **Sequential `try { } catch { }`** (dashboard pages: `overview`, `progress`, `coaching`, `leaderboard`) — each fetch is awaited individually, non-fatal errors are swallowed so the receiving component can render an empty/skeleton state from a `null` prop. **Must call `unstable_rethrow(err)` from `next/navigation` as the first line of the `catch`** before doing anything else with the error — `pythia2Client`'s response interceptor calls Next's `redirect()` server-side on an expired session, which throws a special `NEXT_REDIRECT` error, and an ordinary `catch` would swallow it as if it were a normal fetch failure, silently breaking the redirect. See `dashboard/overview/page.tsx` for the pattern.
  - **`Promise.allSettled`** (manager/owner pages) — several independent fetches run in parallel, each checked via `if (result.status === 'fulfilled') ...`. `Promise.allSettled` never rejects, so a `NEXT_REDIRECT` thrown mid-fetch (session expiry) would otherwise resolve as a silently discarded `'rejected'` result instead of actually redirecting — **must loop over the settled results and call `unstable_rethrow(result.reason)` for each `'rejected'` one** before reading `.value` off the fulfilled ones. See `manager/coaching-tracker/page.tsx` and `manager/dashboard/page.tsx`.
- **Example:** `dashboard/overview/page.tsx` fetches `overview` (still mocked, via `fetchOverview`), `initialSummary` (`fetchDashboardSummary`), and `coachingMoments` (`fetchCoachingMoments`) server-side and passes them as props into `OverviewContent`.

**Client-fetched data — plain `useState` + `useEffect` (for interactive/paginated data):**
- Components that need to fetch after mount (search-as-you-type, infinite scroll, background refresh) call the domain's plain async function directly from a `useEffect`, track `loading`/`error` with local `useState`, and guard against stale responses with a `cancelled` flag.
- If the same data also needs a server-side initial value (e.g. to avoid a loading flash on first paint), the server component fetches page 1 and passes it as an `initialData` prop; the client component seeds its state from that prop and only fetches client-side as a fallback or for subsequent pages/refetches.
- **Example:** `EmployeeAssignPicker.tsx` debounces search input, then fetches via `fetchEmployees()` in a `useEffect` keyed on `[token, debouncedSearch, skip]`. `UnknownIdentitiesPanel.tsx` seeds from a server-fetched `initialData` prop and fetches subsequent pages client-side via `fetchUnknownIdentities()` as the carousel approaches the end of what's loaded.
- Mutations (`assignUnknownIdentity`, swag redemption, etc.) are plain `async` calls wrapped in a local `isPending` state — no mutation hook, no cache invalidation machinery. On success, call whatever callback prop refreshes the relevant data (e.g. re-run the page-1 fetch).

## Shared Components
- When two or more components share a non-trivial piece of UI (e.g. a reusable SVG chart, a card shell, a data table), extract it into its own component under `src/components/shared/<SharedComponentName>/`.
- The shared component receives all variable content via props — it must not import any page-specific data or types directly.
- Define the props interface in `src/types/` using a domain-appropriate filename (e.g. `src/types/line-chart.ts` for a line chart component).
- The consuming components each own their own data file in `src/lib/` and pass it through `useState` as usual — the shared component only renders what it receives.
- **Example:** `src/components/shared/LineChartSvg/LineChartSvg.tsx` — renders a multi-series SVG line chart; used by both `ProgressChart` and `ScoreVsTransactions`, each supplying its own data via `LineChartSvgProps`.

## Modals and Status States
- For recurring status states (like success confirmations or error screens), use the shared `SuccessPage` (`src/components/shared/Modals/Success.tsx`) and `ErrorModal` (`src/components/shared/Modals/Error.tsx`) components.
- These components are already utilized in authentication flows (e.g., Forgot Password, Reset Password) but should be reused anywhere a standard success or error state is needed.
- Both components accept a standard set of props to customize their content: `heading` (string), `message` (string), `actionLabel` (string), and `action` (callback function).
- They enforce a consistent layout (a centered card with an icon, heading, text, and an action button) and ensure visual uniformity across the application.

## Forms and Validation
- **Always use `DynamicForm`** (`src/components/shared/DynamicForm/DynamicForm.tsx`) for form implementations instead of setting up `react-hook-form` manually in individual components.
- `DynamicForm` encapsulates all React Hook Form state, handles field rendering (including text, email, and password types with built-in show/hide toggles), and wires up validation.
- **Validation**: Define Zod schemas in `src/schemas/` and pass them to `DynamicForm` via the `zodSchema` prop. The component automatically uses `zodResolver` to perform validation and display inline field errors.
- Parent components should only manage server action state (`isPending`, `serverError`), define the `FormField` configuration array, and provide an `onSubmit` handler.
- **Example**: `LoginForm.tsx` defines fields and passes `loginSchema` to `DynamicForm`, handling the actual submission via a server action inside a `useTransition`.


## Server State — Plain Fetch (no query library)

There is **no client-side data-fetching/cache library** in this project (TanStack Query was removed once the backend moved to HTTPS). Server-fetched data lives in plain component/store state — `useState` for local, per-component data; a Zustand store's async action pattern (see below) when the data needs to be shared or mutated from multiple places.

### Query files
One file per domain in `src/queries/<domain>.ts`. Each file exports **plain async functions only** — no hooks, no query keys, no cache:
- GET functions call `pythia2Client` directly (never raw `fetch`) and return the parsed response body.
- Mutation functions (POST/PATCH) do the same and return the mutated resource or `void`.
- **Current files:** `unknown-identities.ts` (`fetchUnknownIdentities`, `fetchUnknownIdentitiesCount`, `fetchTrashedIdentities`, `assignUnknownIdentity`, `trashUnknownIdentity`, `restoreUnknownIdentity`); `employees.ts` (`fetchEmployees`, `createEmployee`, `fetchEmployee`, `fetchEmployeeCredentials`); `scorecard.ts` (`fetchDashboardSummary`, `fetchCoachingMoments`); `manager-coaching.ts` (`fetchManagerCoachingPlans`, `applyManagerPlanAction`, `fetchCoachingSummary`, `fetchCoachingEffectiveness`, `fetchCoachingEmployees`, `fetchEmployeeCoachingDetail`); `manager-dashboard.ts` (`fetchManagerDashboardSummary`, `fetchManagerDashboardLeaderboard`, `fetchManagerDashboardTrend`); `admin-config.ts` (`fetchFieldConfigs`, `updateFieldConfig` — backs `adminConfigStore`, see **Super Admin — KPI Visibility System**); `overview.ts` (`fetchOverview`, still a passthrough to the `overviewAPIs` mock — no real endpoint yet). There is no `stores.ts` — store data is hardcoded, see **Store data flow** under **Role-Based Sidebar**.

### Calling pattern
- **From a Server Component** (`page.tsx`): `await` the function directly, wrapped per the two patterns in **Server Component Data Fetching** above (sequential `try/catch` + `unstable_rethrow`, or `Promise.allSettled`), and pass the result as a prop.
- **From a Client Component**: call the function inside a `useEffect`, track `loading`/`error` with local `useState`, guard against stale responses with a `cancelled` flag in the effect cleanup. See **Server Component Data Fetching** above for the `initialData`-seeded variant used for paginated/infinite lists.
- The backend is served over HTTPS, so client components may call `pythia2Client` directly — there is no mixed-content restriction and no need for a same-origin proxy route under `src/app/api/`. (A previous version of this app proxied `/api/employees` and `/api/unknown-identities` through Next.js route handlers to work around a plain-HTTP backend; those routes have been removed now that the workaround is no longer needed.)

### Optimistic updates (Zustand async action pattern)
For data that needs an optimistic update with rollback (e.g. swag redemption), use the **Async action pattern** documented under **State Management — Zustand** below rather than a mutation hook:
```ts
async redeemItem(item) {
  const previous = get().catalog
  set({ redeemingId: item.id, catalog: /* apply optimistic change */ })
  try {
    await fakePost(item.id)
    set({ redeemingId: null })
    return true
  } catch {
    set({ redeemingId: null, catalog: previous })   // roll back
    return false
  }
}
```
`redeemItem` returns `boolean` so the component can show a toast on success/failure without the store knowing about UI — see **Mutation feedback** below.

### States every fetch consumer should handle
| State | How to track | How to surface |
|---|---|---|
| Loading (initial fetch) | local `loading` state, `true` until the promise settles | Skeleton with `animate-pulse` |
| Error | local `error`/`isError` state set in `.catch()` | Error card with retry button (retry = re-run the fetch function) |
| Empty | `!data \|\| data.length === 0` after a successful fetch | Empty-state illustration |
| Fetching more (pagination/infinite scroll) | a separate `isFetchingMore` flag, distinct from the initial `loading` | Subtle "Syncing…" pill |

There is no automatic background refetch or staleness tracking (no `isFetching`/`isStale` — those were TanStack Query concepts). If a screen needs fresher data, re-run the fetch explicitly (e.g. on a user action or an interval you own).

### Mutation feedback
Mutation functions return the resource (or `boolean`/`void`) — side-effects (toasts, navigation, refetching) belong in the calling component's `try { ... } catch { ... }` around the `await`, not inside the query file. Do not put toast calls inside `src/queries/*.ts`.

### Zustand — client and server-derived state
Zustand holds both client-only UI state (store selection, sidebar view-mode) and data fetched from the server where that data needs to be shared across components or mutated via the async action pattern (e.g. `swagStore`'s catalog + redeem flow). There is no query cache to defer to anymore — a Zustand store is the right home for any server data that more than one component needs to read or that supports optimistic mutation.

## State Management — Zustand
- Zustand stores live in `src/store/` as individual files named after their domain (e.g. `src/store/swagStore.ts`).
- Each store file exports a single `use<Domain>Store` hook created with `create<State>(...)`.
- Define the state shape and all actions together in one `interface` — never split them.
- Actions mutate state via `set((state) => ({ ... }))`. Return the same `state` object unchanged for no-op cases (e.g. guard clauses).
- Selectors: consume individual slices with `useStore((s) => s.field)` rather than subscribing to the whole store, to avoid unnecessary re-renders.
- Zustand is the right choice when state needs to be shared across unrelated components or when it outlives a single component's lifetime. For state that is purely local to one component, keep using `useState`. For state shared only within a React subtree, prefer Context.

### Store Subscriptions
- Stores can subscribe to changes in other stores to coordinate global state (e.g., refetching data when the user switches their active store context).
- This is achieved using the `subscribeWithSelector` middleware.
- Create and export a dedicated subscription function for the state slice (e.g., `onStoreChange` in `userStore`) to encapsulate the subscription logic.
- **Example:** `userStore.ts` exports `onStoreChange((next, prev) => ...)`. Other stores or components can call this to trigger a data refetch when `next?.id !== prev?.id`. Always remember to call the returned unsubscribe function on cleanup to prevent memory leaks.

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
- **`src/store/userStore.ts`** — holds `stores: Store[]` (initialized from the hardcoded `STORES` constant, see **Store data flow** under **Role-Based Sidebar**), `currentStore: Store | null`, `currentScore: number | null`, and `points: number | null`. Exposes:
  - `setStores(stores)` — fully replaces the stores list, preserving `currentStore` if it's still present, otherwise defaulting to `stores[0]`. Exists for when a real stores endpoint returns; nothing calls it today.
  - `setCurrentStore(store)` — called when the owner or manager picks a store from the Header dropdown.
  - `setCurrentScore(score)` — called by `OverviewContent` via `useEffect` when the dashboard summary resolves; stores the employee's live `current_score`. Sidebar reads `currentScore` from the store and falls back to `user.score` from the session until it is populated.
  - `setPoints(points)` — seeded from `user.points` by `Sidebar` on mount; decremented (with rollback) by `swagStore.redeemItem()`.
  - `onStoreChange(callback)` — exported subscription helper; other stores/modules call this to react to store-selection changes. Always call the returned unsubscribe on cleanup.
- **`src/store/swagStore.ts`** — holds `catalog: SwagItem[]`, `loading`, `redeemingId`, `error`. Exposes `fetchCatalog()` (GET, called by `SwagStore.tsx` on mount) and `redeemItem(item)` (optimistic redeem + points deduction on `userStore`, rolls back on failure, returns `boolean`). This is a direct instance of the **Async action pattern** above.
- **Note:** `userStore` does not hold a `user` object or a `setUser` action — auth identity lives in the session, accessible via `useSession()`.

## Timers and Async Side Effects
- **Never call `setTimeout` (or `setInterval`) directly inside a `useCallback`, event handler, or any other non-effect function if the timeout updates component state.** Doing so schedules a state update with no cleanup path — in React 19 concurrent/strict mode this triggers "Can't perform a React state update on a component that hasn't mounted yet" because the callback can fire during a remount before the component commits.
- Instead, **move the timer into a `useEffect`** that depends on the state that triggered it, and return a cleanup function that calls `clearTimeout`. This guarantees the timer is cancelled if the component unmounts or the effect re-runs.
- **Correct pattern** (used in `AddCampaignButton` and `ToastContext`):
  ```tsx
  // In the handler / callback — only set state, never schedule timers:
  const show = useCallback((msg: string) => {
    setMessage(msg)
    setVisible(true)
  }, [])

  // In an effect — own the timer lifecycle:
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(t)
  }, [visible])
  ```
- The same rule applies to `setInterval`, `requestAnimationFrame`, and any other async scheduling API — always clean up in the `useEffect` return.

## Mock API Layer
- All fake/mock API functions live in `src/mock/` — one file per domain, named `<domain>APIs.ts` (e.g. `src/mock/swagStoreAPIs.ts`).
- Mock files are the **only** place where `setTimeout`-based fake network delays live. Never inline fake delays in stores or components.
- Mock functions pull their seed data from `src/lib/` — reuse an existing data file if one exists, create a new one if not. Never hardcode data literals inside mock files.
- Each mock function mirrors the real API contract it will eventually replace: same function name, same parameter shape, same return type. Swapping to a real `fetch` call means replacing only the mock file, nothing else.
- **Example:** `src/mock/swagStoreAPIs.ts` — exports `fakeGet` (returns points + catalog from `SWAG_STORE`) and `fakePost` (simulates a redeem with a 15% failure rate); imported by `src/store/swagStore.ts`.

## Loading Skeletons
- **Every page route must have a `loading.tsx` co-located alongside its `page.tsx`.**
- `loading.tsx` uses Next.js's built-in Suspense boundary — it is shown automatically while the page is loading and requires no extra wiring.
- Structure the skeleton to mirror the real page layout: replicate the header bar, then each major section as a rounded `bg-border` block with `animate-pulse` on the root wrapper.
- Use `bg-border` for all skeleton placeholder shapes — this matches the design token and works in both light/dark themes.
- Repeat items that render from a list (cards, rows) with `Array.from({ length: N })` to match the expected count.
- Never import real components or data inside `loading.tsx` — it must be a pure static render with no async work.
- **When adding a new page, always create its `loading.tsx` at the same time.**

## Routes
- Pages are organized by role under four route groups:
  - `src/app/dashboard/` — employee pages: `overview`, `progress`, `coaching`, `leaderboard`, `swag`
  - `src/app/owner/` — owner pages: `roi-attribution`, `benchmarking`, `marketing-loop`
  - `src/app/manager/` — manager pages: `coaching-tracker`, `dashboard`, `employees`, `staffing-intelligence`, `unknown-identities`
  - `src/app/super-admin/` — super admin pages: `kpi-visibility`, plus read-only mirrors of every manager page (`manager/dashboard`, `manager/employees`, `manager/coaching-tracker`, `manager/staffing-intelligence`, `manager/unknown-identities`), every owner page (`owner/roi-attribution`, `owner/benchmarking`, `owner/marketing-loop`), and the employee Overview page only (`employee/overview`) — see **Super Admin — Manager/Employee/Owner Live Views** above
  - `src/app/(auth)/` — public pages, not gated by the proxy's role check: `login/employee`, `login/manager`, `login/owner`, `forgot-password`, `reset-password`
- Each of the four role groups has its own `layout.tsx` — an `async` Server Component that calls `await auth()` and renders `<Sidebar user={...} />`.
- The employee overview page is at `/dashboard/overview` — not at `/`.
- Every route with a `page.tsx` has a co-located `loading.tsx` (see **Loading Skeletons** above) — this holds for all current routes.
<!-- END:project-conventions -->
