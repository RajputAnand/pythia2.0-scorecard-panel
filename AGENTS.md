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
- Demo credentials are defined in `src/lib/demo-user.ts` as `DEMO_USERS` — one entry per role with `email`, `password`, and full profile fields.
- Demo accounts:
  | Role     | Email                | Password   |
  |----------|----------------------|------------|
  | employee | employee@demo.com    | demo1234   |
  | manager  | manager@demo.com     | demo1234   |
  | owner    | owner@demo.com       | demo1234   |
- The JWT callback stores role + profile fields in the token; the session callback surfaces them on `session.user`.
- next-auth type augmentations live in `src/types/next-auth.d.ts` — extends `Session`, `User`, and `JWT` with `role`, `initials`, and profile fields.
- `AUTH_SECRET` must be set in `.env.local`.

## Server Actions
- Server actions live in `src/actions/` as `'use server'` files, one file per domain (e.g. `src/actions/auth.ts`).
- They are the required bridge between `'use client'` components and server-side logic. A file cannot mix `'use client'` and `'use server'` — so any client component that needs to call `signIn`, `signOut`, or mutate server state must import a server action.
- Client components wire actions via `useActionState(action, initialState)` — the action receives `(prevState, formData)` and returns the next state (e.g. an error string, or `undefined` on success).
- **Example:** `LoginForm.tsx` is `'use client'` and cannot call `signIn` directly. It imports `login` from `src/actions/auth.ts` and passes it to `useActionState`.

## Role-Based Sidebar + User Identity
- User identity comes from the **session**, not a static constant.
- `Sidebar.tsx` accepts a `user: User` prop — layouts call `await auth()` to get the session and pass `session.user` down.
- `Sidebar.tsx` renders role-specific nav sections and bottom widget:
  - `employee` → "My Dashboard" nav + employee score pill
  - `manager` → "Manager Tools" nav + store pill (no view toggle)
  - `owner` → "Owner Tools" nav + owner/manager view toggle + store pill; toggling navigates to the default route for that view and swaps nav sections

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
- **Example:** `src/store/swagStore.ts` — `fetchPoints` (GET on mount), `redeem` (POST per item); `SwagStore.tsx` drives all three states: `loading` pulse, per-button `redeemingId` spinner, `error` banner.

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
