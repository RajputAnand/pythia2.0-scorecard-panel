<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-conventions -->
# Project Conventions

## Tech Stack Overview
- **Next.js**: Next.js 16 (App Router, Server Components, `proxy.ts` request proxy).
- **React**: React 19 (Hooks, Server Actions, `useActionState`, `useTransition`).
- **Styling**: Tailwind CSS v4 + minimal CSS Modules with `@apply` and `@reference`.
- **Auth**: Auth.js / NextAuth v5 beta with JWT session tokens and refresh rotation.
- **HTTP**: Axios via custom `pythia2Client` instance (no TanStack Query / React Query).
- **State**: Zustand stores (`userStore`, `swagStore`, `adminConfigStore`, `staffingStore`).
- **Forms & Validation**: `react-hook-form` via shared `DynamicForm` with Zod validation.
- **PDF & Canvas**: `html2canvas-pro` + `jspdf` for sectioned A4 multi-page document export.

---

## Styling — Tailwind CSS v4
- **Use Tailwind utility classes directly in `.tsx` files by default.**
- Use CSS Modules with `@apply` sparingly — only for genuine reuse/abstraction: shared button variants used across multiple pages, `@keyframes` animations, `::before`/`::after` pseudo-elements, and complex selectors that can't be expressed inline (`:nth-child`, descendant rules like `strong` inside dynamic JSX content).
- CSS Module files that use `@apply` must start with `@reference "../../app/globals.css";` (adjust relative path per depth).
- Design tokens (`bg-canvas`, `bg-surface`, `bg-surface-alt`, `bg-primary`, `text-accent`, `text-accent-mid`, `bg-accent`, `bg-accent-light`, `border-border`, `border-border-subtle`, `text-danger`, `bg-danger`, `text-warning`, `bg-warning`) are defined in `src/app/globals.css` under `@theme inline` and work as Tailwind utility classes directly in TSX — no `@reference` needed there.

---

## Component Structure & Page Assembler Pattern
- **Split every HTML page into components** — each distinct section becomes its own component.
- Components live in `src/components/<ComponentName>/` with `<ComponentName>.tsx` + `<ComponentName>.module.css`.
- `page.tsx` is a clean assembler only — it imports components and arranges them. No inline JSX markup or custom styles in `page.tsx`.
- `page.module.css` contains only layout/spacing for the page shell (`.content`, `.twoCol`, etc.).
- Client components (needing `useState`, `useEffect`, etc.) go in `src/components/` too — not co-located in the route folder.
- Shared reusable components live under `src/components/shared/<SharedComponentName>/`.

---

## Header Buttons
- The `Header` component accepts page-specific action buttons via `children`.
- Button styles are defined in `Header.module.css` and imported by each page:
  - `headerStyles.btnGhost` — bordered, secondary text
  - `headerStyles.btnAccent` — green background, white text
  - `headerStyles.btnPrimary` — dark (`bg-primary`) background, white text

---

## Authentication & Session Architecture
- Auth is handled by **next-auth v5** (Auth.js). Config lives in `src/auth.ts` — exports `{ handlers, signIn, signOut, auth }`.
- Demo credentials are defined in `src/lib/demo-user.ts` as `DEMO_USERS` — one entry per role with `email` and `password` only:
  | Role        | Email                  | Password   |
  |-------------|------------------------|------------|
  | employee    | employee@demo.com      | demo1234   |
  | manager     | manager@demo.com       | demo1234   |
  | owner       | owner@demo.com         | demo1234   |
  | superadmin  | superadmin@demo.com    | demo1234   |
- The JWT callback stores auth-only fields in the token; the session callback surfaces them on `session.user`.
- **Session shape** (`src/types/next-auth.d.ts`):
  - `role`: `'employee' | 'manager' | 'owner' | 'superadmin'`
  - `initials`: user initials string (e.g. `'MR'`)
  - `token` / `pythia2Token`: API Bearer token string
  - `refreshToken`: token sent to `POST /auth/refresh` on 401s
  - `score`: baseline employee performance score
  - `jobTitle`: job title string (e.g. `'Sales Associate'`)
  - `points`: employee swag points balance
- Store data is **not** in the session — `userStore` seeds `stores` from a hardcoded constant `STORES` in `src/lib/store-data.ts`.
- `NEXTAUTH_SECRET` must be set in `.env.local`.
- `SessionProvider` is mounted in the root layout (`src/providers/SessionProvider.tsx`) so `useSession()` works in all client components.

---

## Server Actions
- Server actions live in `src/actions/` as `'use server'` files, one file per domain (e.g. `src/actions/auth.ts`).
- Server actions bridge client components and server logic. A file cannot mix `'use client'` and `'use server'`.
- Client components wire actions via `useActionState(action, initialState)` or execute inside `useTransition`.
- `login()` in `src/actions/auth.ts` posts credentials to `POST /auth/login` and invokes Auth.js `signIn('credentials', ...)` with user payload.
- `logout()` in `src/actions/auth.ts` calls Auth.js `signOut()`.

---

## Role-Based Routing & Next.js 16 Proxy (`src/proxy.ts`)
- `src/proxy.ts` enforces authentication and role-based route access on every request.
  - **Note:** Next.js 16 renamed `middleware.ts` → `proxy.ts` and `export function middleware` → `export function proxy`. Always use `proxy.ts` and the `proxy` export.
- Unauthenticated requests to protected pages redirect to `/login/employee?redirectTo=<path>`. Public routes are `/login/employee`, `/login/manager`, `/login/owner`, `/login/superadmin`, `/forgot-password`, `/reset-password`.
- Authenticated requests to `/` or `/login` redirect to the role's `ROLE_DEFAULT_ROUTES[role]`.
- Accessing a route outside a role's allowed prefix redirects to the default page.
- Role → allowed route prefixes → default route:
  | Role         | Allowed Prefixes           | Default Route                     | Dedicated Login Route      |
  |--------------|----------------------------|-----------------------------------|----------------------------|
  | `employee`   | `/dashboard`               | `/dashboard/overview`             | `/login/employee`          |
  | `manager`    | `/manager`                 | `/manager/coaching-tracker`       | `/login/manager`           |
  | `owner`      | `/owner`, `/manager`       | `/owner/roi-attribution`          | `/login/owner`             |
  | `superadmin` | `/super-admin`             | `/super-admin/kpi-visibility`     | `/login/superadmin`        |
- Owners oversee managers and can access all `/manager/*` routes. Managers cannot access `/owner/*`.
- **Dynamic KPI Visibility Route Enforcement**: `proxy.ts` Derives `PAGE_HREF_TO_FIELD_ID` from `PAGE_REGISTRY`. If an authenticated user attempts to access a page that has been disabled in the Super Admin KPI visibility settings (`GET /super-admin/field-config`), the proxy intercepts the request and redirects them to their role's default route. It fails open on fetch errors to ensure platform resiliency.

---

## Role-Based Sidebar & Dynamic Navigation
- User identity comes from the **session**, not a static constant.
- `Sidebar.tsx` receives `user: User` prop from the server-side role layout (`await auth()`).
- Navigation sections and bottom widgets per role:
  - `employee`: "My Dashboard" navigation + employee score & points pill (`currentScore ?? user.score`).
  - `manager`: "Navigate" (Dashboard, Employees) + "Manager Tools" (Coaching Tracker, Staffing, Unknown Identity, Video Identities) + store status pill.
  - `owner`: "Owner Tools" (Stores, Managers, ROI Attribution, Benchmarking) + Owner/Manager view toggle switcher + store status pill.
  - `superadmin`: 4-Way View Switcher (`Admin`, `Manager View`, `Employee View`, `Owner View`) with bidirectional URL sync and read-only mirror pages.
- The store pill (`storeName`, `location`) in Sidebar comes from `useUserStore(s => s.currentStore)` (Zustand), not the session.
- **Header Store Selector**: Renders for `owner`, `manager`, and `superadmin` roles when stores are present (`role !== 'employee' && stores.length > 0`).

---

## Super Admin — KPI Visibility System
- The KPI Visibility tool at `/super-admin/kpi-visibility` (`KpiVisibilityPanel.tsx`) lets Super Admins toggle individual cards/graphs/panels on/off or toggle whole pages off (which removes them from the Sidebar and blocks them at the proxy).
- **Registry (`src/lib/admin-config-data.ts`)**:
  - `KPI_IDS`: Stable string IDs for every individual card/graph/panel.
  - `PAGE_IDS`: Stable string IDs for sidebar-level page toggles.
  - `KPI_REGISTRY: KpiRegistryEntry[]`: Registry of `{ id, label, description, type, role, page, pageHref }`.
  - `PAGE_REGISTRY: PageRegistryEntry[]`: Registry of `{ id, role, page, pageHref }`.
  - `PAGE_ID_BY_HREF`: Lookup mapping page href to page ID.
  - `ROLE_BY_FIELD_ID`: Lookup mapping field ID to owning `AdminRole`.
- **State Store (`src/store/adminConfigStore.ts`)**: Backed by `src/queries/admin-config.ts` (`GET /super-admin/field-config` and `PUT /super-admin/field-config/{role}`). Defaults to `true` (`visibility[id] ?? true`).
- **Component Wiring**:
  - **Coarse pattern**: `const visible = useAdminConfigStore(s => s.visibility[KPI_IDS.xxx] ?? true); if (!previewMode && !visible) return null;`
  - **Fine-grained pattern**: Multi-card arrays filtered by `visibility[card.id] ?? true` with dynamic CSS grid `repeat(${cards.length}, 1fr)` and `highlightId` support.
  - Previews registered in `src/components/KpiVisibilityPanel/kpiPreviews.tsx` with sample data from `src/lib/kpi-preview-data.ts`.

---

## Super Admin — Live Mirror Pages
- Super Admin has access to read-only mirrors of:
  - **Manager Pages**: `/super-admin/manager/{dashboard,employees,coaching-tracker,staffing-intelligence,unknown-identities,video-identities}`.
  - **Owner Pages**: `/super-admin/owner/{roi-attribution,benchmarking,marketing-loop}`.
  - **Employee Page**: `/super-admin/employee/overview` (renders real components with preview datasets).
- Mirror pages do NOT pass `previewMode`, so admin-configured visibility toggles remain active in mirrors.
- Manager mirrors pass the Super Admin's token to real backend queries; backend helpers (`scoped_store_ids`) treat Super Admin's store access as unrestricted.

---

## HTTP Client — Axios (`src/lib/api-client.ts`)

All real API calls go through the `pythia2Client` axios instance. Never use `fetch` directly in server actions or query functions.

```ts
import { pythia2Client } from '@/lib/api-client'
```

- **Request Configuration**: `Content-Type: application/json` default (unset for `FormData` multipart uploads). Pass Bearer token via `headers: { Authorization: \`Bearer ${token}\` }`.
- **Response Interceptor (401 Refresh Rotation)**:
  1. Catches 401 on requests carrying a Bearer token.
  2. Coalesces concurrent 401s into a single `POST /auth/refresh` call using `session.user.refreshToken`.
  3. On success, calls `signIn('credentials', { redirect: false })` to refresh next-auth session cookies and retries original request with new access token.
  4. On failure or missing refresh token, redirects to role-specific login page (`ROLE_LOGIN_ROUTES[role]`).

---

## API Endpoints (`src/utils/api-endpoints.ts`)

Endpoints are registered in `PYTHIA_2_API`:
- **`auth`**: `login`, `refresh`, `forgotPassword`, `resetPassword`, `p1Profile`
- **`dashboard`**: `summary`, `shiftSummaryHighlights`
- **`demographics`**: `ageDistribution`, `genderDistribution`, `customerSegments`
- **`benchmarking`**: `allStoreData`, `networkIntelligence`
- **`roi`**: `attribution`, `shareWithInvestor`
- **`coaching`**: `moments`
- **`employees`**: `list`, `create`, `archived`, `detail(id)`, `credentials(id)`, `archive(id)`, `unarchive(id)`
- **`unknownIdentities`**: `list`, `count`, `trashed`, `assign(id)`, `trash(id)`, `restore(id)`
- **`videoIdentities`**: `list`, `stats`, `presign`
- **`managerCoaching`**: `signals`, `signal(planId)`, `summary`, `effectiveness`, `employees`, `employeeDetail(userId)`
- **`managerDashboard`**: `summary`, `leaderboard`, `trend`
- **`superAdmin`**: `fieldConfig`, `fieldConfigForRole(roleName)`
- **`deviceHealth`**: `list`, `detail(deviceId)`, `ws`
- **`staffing`**: `schedule`, `scheduleGenerate`, `scheduleEntry(shiftId)`, `schedulePublish`, `roster`, `trafficHeatmap`, `insights`, `recommendations`, `recommendationsGenerate`, `recommendationApply(id)`, `recommendationDismiss(id)`

---

## Query Modules (`src/queries/`)

Each domain has a dedicated query module exporting pure async functions:
1. `admin-config.ts`: `fetchFieldConfigs`, `updateFieldConfig`.
2. `benchmarking.ts`: `fetchAllStoreData`, `fetchNetworkIntelligence`.
3. `demographics.ts`: `fetchAgeDistribution`, `fetchGenderDistribution`, `fetchCustomerSegments`.
4. `device-health.ts`: `fetchDeviceStates`, `fetchDeviceDetail`, `getDeviceStatesWsUrl`.
5. `employees.ts`: `fetchEmployees`, `createEmployee`, `fetchArchivedEmployees`, `fetchEmployee`, `fetchEmployeeCredentials`, `archiveEmployee`, `unarchiveEmployee`.
6. `manager-coaching.ts`: `fetchManagerCoachingPlans`, `fetchManagerCoachingPlan`, `applyManagerPlanAction`, `fetchCoachingSummary`, `fetchCoachingEffectiveness`, `fetchCoachingEmployees`, `fetchEmployeeCoachingDetail`.
7. `manager-dashboard.ts`: `fetchManagerDashboardSummary`, `fetchManagerDashboardLeaderboard`, `fetchManagerDashboardTrend`.
8. `managers.ts`: `fetchManagers`, `fetchArchivedManagers`, `createManager`, `fetchManagerCredentials`, `archiveManager`, `unarchiveManager` (mock layer integration ready for backend swap).
9. `overview.ts`: `fetchOverview`.
10. `owner-roi.ts`: `fetchRoiAttribution`, `shareRoiAttributionPdf`.
11. `scorecard.ts`: `fetchDashboardSummary`, `fetchShiftHighlights`, `fetchCoachingMoments`.
12. `staffing.ts`: `fetchStaffingSchedule`, `createStaffingShift`, `updateStaffingShift`, `deleteStaffingShift`, `generateStaffingSchedule`, `publishStaffingSchedule`, `fetchStaffingRoster`, `fetchStaffingHeatmap`, `fetchStaffingInsights`, `fetchStaffingRecommendations`, `generateStaffingRecommendations`, `applyStaffingRecommendation`, `dismissStaffingRecommendation`.
13. `unknown-identities.ts`: `fetchUnknownIdentities`, `fetchUnknownIdentitiesCount`, `fetchTrashedIdentities`, `assignUnknownIdentity`, `trashUnknownIdentity`, `restoreUnknownIdentity`.
14. `video-identities.ts`: `fetchVideoIdentities`, `fetchVideoIdentityStats`, `presignVideoIdentityKeys`.
15. `stores.ts`: `fetchStoresForTenant`, `fetchDeactivatedStores`, `deactivateStore`, `activateStore`, `createStore`, `bulkCreateStores`, `simulateStoreHeartbeat`, `updateStore`.

---

## State Management — Zustand Stores (`src/store/`)

1. **`userStore.ts`**:
   - Holds `stores: Store[]`, `currentStore: Store | null`, `currentScore: number | null`, `points: number | null`.
   - Actions: `setStores`, `setCurrentStore`, `setCurrentScore`, `setPoints`.
   - Subscriptions: `onStoreChange((next, prev) => ...)` coordinate state refetches on store switches.
2. **`swagStore.ts`**:
   - Holds `catalog: SwagItem[]`, `loading`, `redeemingId`, `error`.
   - Actions: `fetchCatalog`, `redeemItem` (optimistic balance decrement on `userStore` with rollback on failure).
3. **`adminConfigStore.ts`**:
   - Holds `visibility: Record<string, boolean>`, `fieldsByRole: Record<string, Record<string, boolean>>`, `loading`, `savingId`, `error`.
   - Actions: `fetchVisibility`, `setCardVisibility`.
4. **`staffingStore.ts`**:
   - Holds `schedule`, `roster`, `heatmap`, `insights`, `recommendations`, `criticalAlert`, `generationStatus`, `pollingRecommendations`, `savingShift`, `publishing`.
   - Actions: `hydrate`, `fetchAll`, `saveShift`, `deleteShift`, `generateSchedule`, `publishSchedule`, `generateRecommendations` (polls Gemini batch jobs), `applyRecommendation`, `applyAllRecommendations`, `dismissRecommendation`.

---

## Custom Hooks (`src/hooks/`)
- **`useDashboardSummary`**: Handles week navigation (offsets 0 and 1), SSR initial data hydration, AbortController cancellation, and week label formatting.
- **`useShiftHighlights`**: Fetches AI-generated shift summary highlights based on `shiftStart` and `shiftStatus` with `isFirstRun` hydration guards.
- **`useStalledCoachingPlans`**: Fetches open/in-progress manager coaching plans, resolves employee display names, computes stalled plan counts, and provides `patchPlan` local state updates.

---

## Feature Architectures

### Staffing Intelligence
- AI schedule generator and recommendation engine.
- Polling loop (`POLL_INTERVAL_MS = 2000`, `POLL_MAX_ATTEMPTS = 30`) tracks Gemini async generation.
- Shift CRUD maps morning/afternoon/evening day-parts and pairings.

### Video Identities & Unknown Identities
- Unknown face crop review carousel with infinite scroll pagination.
- Employee assignment modal, soft-trash, and trash restoration.
- S3 presigned asset resolution: `presignVideoIdentityKeys` resolves secure temporary playback URLs on demand only when a video/crop is opened.

### Super Admin Device Health (WebSockets)
- Hybrid REST + WebSocket architecture at `/super-admin/device-health`.
- Instant initial snapshot via `fetchDeviceStates`.
- Live WebSocket stream (`GET /device-states/ws`) authenticated via in-socket handshake JSON (`{ token }`) on `onopen`.
- Reconnects after 3-second delay on disconnection; merges `device_update` telemetry frames into state.

### Owner ROI Attribution & PDF Export
- Dynamic correlation line charts (`ScoreVsTransactions`, `HospitalityVsDwell`, `CheckoutSpeed`) mapped via `src/utils/roi-chart-mapper.ts`.
- Multi-page non-breaking A4 PDF generation via `generateSectionedPdf` in `src/utils/pdf-export.ts` (`html2canvas-pro` + `jspdf`). Uses JPEG quality 0.92 to keep attachment sizes under 15MB.
- Multipart email dispatch via `shareRoiAttributionPdf` (`POST /roi/attribution/share`).

---

## Forms, Validation & Modals
- **Forms**: Always use `DynamicForm` (`src/components/shared/DynamicForm/DynamicForm.tsx`).
- **Validation**: Define Zod schemas in `src/schemas/` (`auth.ts`, `employee.ts`, `manager.ts`, `tenant.ts`, `investor-share.ts`) and pass to `DynamicForm` via `zodSchema`.
- **Status Modals**: Standardize status screens with `SuccessPage` (`src/components/shared/Modals/Success.tsx`) and `ErrorModal` (`src/components/shared/Modals/Error.tsx`).
- **Action Modals**: `CreateEmployeeModal`, `CreateManagerModal`, `CreateStoreModal`, `EditStoreModal`, `ConfirmDeactivateStoreModal`, `RevealCredentialsModal`, `ConfirmArchiveEmployeeModal`, `ConfirmArchiveManagerModal`, `StalledPlansModal`.

---

## Data Fetching & Strict Rules

1. **NO TanStack Query / React Query**: Plain `async`/`await` in server components and `useState` + `useEffect` in client components.
2. **Server Fetching Rethrow Rule**:
   - Sequential `try/catch`: Always call `unstable_rethrow(err)` from `next/navigation` as the first line of `catch` to avoid swallowing Next.js redirect exceptions.
   - `Promise.allSettled`: Loop through rejected results and call `unstable_rethrow(result.reason)`.
3. **Client Fetching Rule**: Guard against race conditions and memory leaks with `cancelled` boolean and `AbortController`.
4. **Loading Skeletons**: Every `page.tsx` must have a co-located `loading.tsx` using `bg-border` and `animate-pulse`.
<!-- END:project-conventions -->
