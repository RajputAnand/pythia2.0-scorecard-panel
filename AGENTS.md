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
- Demo credentials are defined in `src/lib/demo-user.ts` as `DEMO_USERS` — one entry per role with `email` and `password` only (no store data — that comes from the API).
- Demo accounts:
  | Role     | Email                | Password   |
  |----------|----------------------|------------|
  | employee | employee@demo.com    | demo1234   |
  | manager  | manager@demo.com     | demo1234   |
  | owner    | owner@demo.com       | demo1234   |
- The JWT callback stores auth-only fields in the token; the session callback surfaces them on `session.user`.
- **Session shape** — only these fields are stored in the JWT/session: `role`, `initials`, `token` (API bearer token), `score`, `jobTitle`. Store data (`storeName`, `storeLoc`, `nodesOnline`, `stores`) is **not** in the session — it is fetched client-side via `useStoresQuery`.
- next-auth type augmentations live in `src/types/next-auth.d.ts` — extends `Session`, `User`, and `JWT` with the auth-only fields above.
- `NEXTAUTH_SECRET` must be set in `.env.local`.
- **`SessionProvider`** is mounted in the root layout (`src/providers/SessionProvider.tsx`) so that `useSession()` works in all client components.

## Server Actions
- Server actions live in `src/actions/` as `'use server'` files, one file per domain (e.g. `src/actions/auth.ts`).
- They are the required bridge between `'use client'` components and server-side logic. A file cannot mix `'use client'` and `'use server'` — so any client component that needs to call `signIn`, `signOut`, or mutate server state must import a server action.
- Client components wire actions via `useActionState(action, initialState)` — the action receives `(prevState, formData)` and returns the next state (e.g. an error string, or `undefined` on success).
- **Example:** `LoginForm.tsx` is `'use client'` and cannot call `signIn` directly. It imports `login` from `src/actions/auth.ts` and passes it to `useActionState`.
- **Login action is auth-only.** `src/actions/auth.ts → login()` only POSTs credentials and calls `signIn` with the auth fields (`id`, `email`, `name`, `role`, `token`, `initials`, `score`, `jobTitle`). It does **not** fetch stores — that happens client-side after login via `useStoresQuery`.

## Role-Based Sidebar + User Identity
- User identity comes from the **session**, not a static constant.
- `Sidebar.tsx` accepts a `user: User` prop — layouts call `await auth()` to get the session and pass `session.user` down.
- `Sidebar.tsx` renders role-specific nav sections and bottom widget:
  - `employee` → "My Dashboard" nav + employee score pill
  - `manager` → "Manager Tools" nav + store pill (no view toggle)
  - `owner` → "Owner Tools" nav + owner/manager view toggle + store pill; toggling navigates to the default route for that view and swaps nav sections
- The store pill (`storeName`, `location`) in the Sidebar comes from **`useUserStore(s => s.currentStore)`** (Zustand), not from the session. Do not read store display data from `user` props.
- The employee score in the Sidebar bottom widget uses **`useUserStore(s => s.currentScore)`** with a fallback to `user.score` from the session (`currentScore ?? user.score`). `currentScore` is populated by `OverviewContent` when weekly stats load; before that, the session score is shown.
- `Header.tsx` does **not** accept a `user` prop. It calls `useSession()` directly to read the token and role. Pages must not pass `user` to `<Header>`.
- **Header store selector** — renders for both `owner` and `manager` roles (not employee). Condition: `(role === 'owner' || role === 'manager') && stores.length > 0`. Do not restrict it to `owner` only.
- Store data flow: `Header` calls `useStoresQuery(token)` → on success calls `useUserStore.setStores()` → Sidebar and other components read `currentStore` from Zustand.

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
  | `employee` | `/dashboard`              | `/dashboard/overview`             |
  | `owner`    | `/owner`, `/manager`      | `/owner/roi-attribution`          |
  | `manager`  | `/manager`                | `/manager/coaching-tracker`       |
- Owners can access `/manager/*` routes (they oversee managers); managers cannot access `/owner/*`.

## HTTP Client — Axios

All real API calls go through one of two named axios instances exported from `src/lib/api-client.ts`. Never use `fetch` directly in server actions or query functions.

```ts
import { pythia1Client, pythia2Client } from '@/lib/api-client'
```

| Client | Env var | Purpose |
|---|---|---|
| `pythia1Client` | `NEXT_PUBLIC_PYTHIA_1_API_URL` | Auth, stores, and all Pythia-1 backend endpoints |
| `pythia2Client` | `NEXT_PUBLIC_PYTHIA_2_API_URL` | Pythia-2 data service endpoints |

- Both instances share the same `createClient()` factory which attaches `Content-Type: application/json` and has stubbed request/response interceptors.
- **Request interceptor** — inject `Authorization: Bearer <token>` here when session-based auth is wired centrally. For now, pass the token per-call: `{ headers: { Authorization: \`Bearer ${token}\` } }`.
- **Response interceptor** — add 401 redirect / global error normalisation here.
- Axios throws on 4xx/5xx. Catch with `axios.isAxiosError(err)` to extract `err.response?.data?.message` before falling back to a generic message.

## API Endpoints

Endpoint paths (no base URL) live in `src/utils/api-endpoints.ts`, split by backend:

```ts
import { PYTHIA_1_API, PYTHIA_2_API } from '@/utils/api-endpoints'
```

- `PYTHIA_1_API` — auth (`/auth/login`, `/auth/forgot-password`, `/auth/reset-password`) and stores (`/stores/all/mine`).
- `PYTHIA_2_API` — Pythia-2 data endpoints: `scorecard.weekly` (`/scorecard/weekly-stats`). Add new endpoints here as they are defined.
- Always use the matching client + endpoint constant together. `pythia1Client` + `PYTHIA_1_API`, `pythia2Client` + `PYTHIA_2_API`.

## API Response Types

Canonical response envelopes live in `src/types/api.ts`:

```ts
// Pythia-1 backend
interface ApiResponseV1<T> { statusCode: number; message: string; data: T }

// Pythia-2 backend
interface ApiResponseV2<T> { success: boolean; message?: string; data: T }
```

Pass the type to the axios generic: `pythia1Client.get<ApiResponseV1<Store[]>>(...)`. Then check `response.data.statusCode === 200` (V1) or `response.data.success` (V2) for application-level success.

Raw API shapes (as returned by the backend before any mapping) live in domain type files under `src/types/`:
- `src/types/store.ts` — `ApiStore` (Pythia-1 `/stores/all/mine` response item: `_id`, `name`, `storeNo`, `location`, `district`, `createdBy`, `updatedBy`, timestamps, `__v`).

## Shared Utilities
- Common, reusable functions with no coupling to a specific component go in `src/utils/common.ts` as named exports on the `Utils` class or as standalone exports.
- Do not duplicate utility logic across components — extract to `src/utils/common.ts` on first reuse.
- If shared logic relies on React APIs (e.g. `useState`, `useEffect`), first evaluate whether a Context is the right fit: a Context makes sense when the state/logic is genuinely shared across many components in the tree and doesn't belong to one owner. If the logic is only incidentally duplicated or the coupling would be forced, keep it local or extract a plain utility instead. When Context is the right call, add it under `src/context/`.
  - **Example:** `src/context/ToastContext.tsx` — manages toast visibility and message via `useState`; any component calls `useToast()` to trigger a toast without prop-drilling or duplicating the state.
- **Existing utilities in `src/utils/common.ts`:**
  - `renderText(text)` — splits a string on `**bold**` markers and returns React nodes.
  - `getWeekSubtitle(date)` — returns `"Week of MMM D – MMM D, YYYY"` for the Mon–Sun week containing `date`. Used by all dashboard `page.tsx` files for the Header subtitle.
  - `getGreeting(date?)` — returns `"Good morning"`, `"Good afternoon"`, or `"Good evening"` based on the hour of `date` (defaults to `new Date()`). Used by `HeroBanner`.

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

**Preferred pattern — TanStack Query + HydrationBoundary (used by `dashboard/overview`):**
- `page.tsx` (server component) creates a fresh `QueryClient`, calls `prefetchQuery` with the domain query function, then wraps the client component in `<HydrationBoundary state={dehydrate(queryClient)}>`.
- The client component (e.g. `OverviewContent.tsx`) calls `useOverviewQuery()` — finds the cache already populated, renders immediately with no loading flash.
- After `staleTime`, TanStack Query background-refetches on the next window-focus, showing `isFetching` without a loading skeleton.
- See the **Server State — TanStack Query** section above for the full pattern.

**Legacy pattern — props drilling (retained for simple static pages):**
- `page.tsx` is an `async` Server Component that `await`s the API call and passes data down as props.
- The page-level fetch uses a fake API helper from `src/mock/<domain>APIs.ts`. Swap for a real `fetch` when the backend is ready — nothing else changes.
- Use this only when the page data is static (no background refresh needed) or when the component tree is shallow enough that props are simpler than a query hook.
- ISR (`revalidate`) may be added to `page.tsx` in the future — keep the async pattern compatible by not mixing server fetches with client-only code inside the page file.

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


## Server State — TanStack Query

TanStack Query (`@tanstack/react-query`) owns all server-fetched data. Do **not** store server responses in Zustand — keep them in the query cache.

### Setup
- `src/lib/query-client.ts` — `makeQueryClient()` factory (browser singleton via `getQueryClient()`).
- `src/providers/QueryProvider.tsx` — `'use client'` wrapper; mounts `QueryClientProvider` + `ReactQueryDevtools`.
- `src/providers/SessionProvider.tsx` — `'use client'` wrapper around next-auth's `SessionProvider`; required for `useSession()` in client components.
- Root layout wraps the app in `<SessionProvider><QueryProvider>…</QueryProvider></SessionProvider>`.

### Query keys
All keys live in `src/queries/keys.ts` as a single `queryKeys` object with a hierarchical shape:
```ts
// Targeted invalidation: invalidate all swag queries
queryClient.invalidateQueries({ queryKey: queryKeys.swag.all })

// Targeted invalidation: only the store query
queryClient.invalidateQueries({ queryKey: queryKeys.swag.store() })
```
Add new domains to `keys.ts` — never define keys inline in components or hooks.

### Query files
One file per domain in `src/queries/<domain>.ts`. Each file exports:
1. **A plain async function** — the query function (e.g. `fetchSwagStore`). Use `pythia1Client` / `pythia2Client` (never raw `fetch`).
2. **`use<Domain>Query()`** — a `useQuery` hook with the domain key and `staleTime`.
3. **`use<Domain>Mutation()`** — a `useMutation` hook for writes, with optimistic updates where the operation is reversible.

**Exception — plain-vanilla fetches:** Some endpoints are not yet integrated into TanStack Query. These files export only the plain async function (no hook, no query key). The consuming component fetches with `useState` + `useEffect` directly.
- `src/queries/scorecard.ts` — exports `fetchWeeklyStats(token)` only. Do **not** add a `useWeeklyStatsQuery` hook or a `scorecard` key to `keys.ts` until full TanStack Query integration is intentionally wired up.

### Mixed-content workaround — server-side proxy fetch
When a Pythia-2 API endpoint is served over plain HTTP but the app is deployed to an HTTPS origin, browsers block the client-side `XMLHttpRequest` (mixed-content policy). Node.js has no such restriction, so the fix is to move the call to the server component.

**Pattern** (used by `dashboard/overview`):
1. In `page.tsx` (server component), call `await auth()` to get the bearer token, then call the query function directly (e.g. `fetchWeeklyStats(token)`).
2. Pass the result as a prop to the client component.
3. Comment out (do **not** delete) the original `useEffect`/`useState` client-side fetch in the client component so it can be restored when the API is behind HTTPS.

```tsx
// page.tsx — server component
const session = await auth()
let weeklyStats: WeeklyStats | null = null
if (session?.user?.token) {
  try { weeklyStats = await fetchWeeklyStats(session.user.token) } catch { /* non-fatal */ }
}
// ...
<OverviewContent weeklyStats={weeklyStats} />
```

**This is a temporary workaround.** Once the API endpoint is served over HTTPS, revert by:
- Removing the `auth()` call and prop drilling from `page.tsx`.
- Restoring the commented-out `useState`/`useEffect` block in the client component.

### Login-gated queries (stores)
Queries that need an auth token use the token as part of their query key so a new login always triggers a fresh fetch:
```ts
// src/queries/stores.ts
export function useStoresQuery(token?: string) {
  return useQuery({
    queryKey: queryKeys.stores.list(token),   // key includes token
    queryFn: () => fetchStores(token!),
    enabled: !!token,
    staleTime: 10 * 60 * 1000,
    gcTime: 0,   // wipe cache when Header unmounts (logout) → fresh fetch on next login
  })
}
```
- `gcTime: 0` guarantees a fresh fetch on every login even if the token hasn't changed, because the cache is dropped the moment the last observer (Header) unmounts on logout.
- The `Header` component is the single caller of `useStoresQuery`. It syncs the result into Zustand via `useEffect → setStores()`. All other components read from `useUserStore` — they do not call `useStoresQuery` directly.

### Optimistic updates pattern
```ts
useMutation({
  mutationFn: (item) => redeemSwagItem(item.id),
  onMutate: async (item) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.swag.store() })
    const previous = queryClient.getQueryData(queryKeys.swag.store())
    queryClient.setQueryData(queryKeys.swag.store(), (old) => /* apply change */)
    return { previous }       // saved for rollback
  },
  onError: (_err, _item, ctx) => {
    queryClient.setQueryData(queryKeys.swag.store(), ctx?.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.swag.store() })
  },
})
```
- `onMutate` → cancel in-flight refetches, snapshot cache, apply optimistic change.
- `onError` → roll back to snapshot.
- `onSettled` → always invalidate to sync with server truth.

### Five states every query consumer must handle
| State | Flag | How to surface |
|---|---|---|
| Loading (initial fetch, empty cache) | `isLoading` | Skeleton with `animate-pulse` |
| Error | `isError` | Error card with retry button |
| Empty | `!data \|\| data.items.length === 0` | Empty-state illustration |
| Background refetch | `isFetching && !isLoading` | Subtle "Syncing…" pill |
| Stale data | `isStale && !isFetching` | "Data may be outdated" badge |

### Server prefetch + Hydration (Next.js App Router)
For pages where the data should be ready on first render (no loading flash), prefetch in the server component and pass the dehydrated state to `HydrationBoundary`:
```tsx
// page.tsx — server component
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { fetchOverview } from '@/queries/overview'
import { queryKeys } from '@/queries/keys'

export default async function Page() {
  const queryClient = new QueryClient()   // fresh per-request instance
  await queryClient.prefetchQuery({
    queryKey: queryKeys.overview.dashboard(),
    queryFn: fetchOverview,
  })
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OverviewContent />    {/* 'use client' — calls useOverviewQuery() */}
    </HydrationBoundary>
  )
}
```
The client component finds data already in cache: `isLoading` is `false`, no network round-trip. After `staleTime` elapses, TanStack Query background-refetches on the next window-focus event.

### Mutation feedback
Mutations return `void` — side-effects (toasts, navigation) belong in the component's `onSuccess`/`onError` callbacks passed to `mutate(item, { onSuccess, onError })`. Do not put toast calls inside the mutation hook.

### Zustand — client-only UI state
Zustand remains the right tool for **client-only** state that is not fetched from the server and that outlives a single component (e.g. `userStore` for store selection UI state, sidebar view-mode toggles). Never use Zustand to cache server responses — that belongs in the TanStack Query cache.

**Example:** `src/queries/swag.ts` — `fetchSwagStore` (GET), `useSwagStoreQuery` (query hook), `useRedeemSwagItem` (mutation with optimistic update); consumed by `SwagStore.tsx`, `HeroBanner.tsx`, and `Sidebar.tsx`.

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
- **`src/store/userStore.ts`** — holds `stores: Store[]`, `currentStore: Store | null`, and `currentScore: number | null`. Exposes:
  - `setStores(stores)` — called by `Header` when `useStoresQuery` resolves; preserves `currentStore` if the selected store is still in the new list, otherwise defaults to `stores[0]`.
  - `setCurrentStore(store)` — called when the owner or manager picks a store from the Header dropdown.
  - `setCurrentScore(score)` — called by `OverviewContent` via `useEffect` when `weeklyStats` resolves; stores the employee's live `current_score`. Sidebar reads `currentScore` from the store and falls back to `user.score` from the session until it is populated.
  - `onStoreChange(callback)` — exported subscription helper; other stores/modules call this to react to store-selection changes. Always call the returned unsubscribe on cleanup.
- **Note:** `swagStore.ts` has been removed; swag data is now managed by `src/queries/swag.ts` via TanStack Query. `userStore` no longer holds a `user` object or a `setUser` action — auth identity lives in the session, accessible via `useSession()`.

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
- Pages are organized by role under three route groups:
  - `src/app/dashboard/` — employee pages: `overview`, `progress`, `coaching`, `leaderboard`, `swag`
  - `src/app/owner/` — owner pages: `roi-attribution`, `benchmarking`, `marketing-loop`
  - `src/app/manager/` — manager pages: `coaching-tracker`, `staffing-intelligence`
- Each group has its own `layout.tsx` — an `async` Server Component that calls `await auth()` and renders `<Sidebar user={...} />`.
- The employee overview page is at `/dashboard/overview` — not at `/`.
<!-- END:project-conventions -->
