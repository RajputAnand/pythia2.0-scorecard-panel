<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-conventions -->
# Project Conventions — Pythia 2.0 Frontend (`Pythia2.0-frontend1`)

## Tech Stack Overview
- **Next.js**: Next.js 16 (App Router, Server Components, `proxy.ts` request proxy).
- **React**: React 19 (Hooks, Server Actions, `useActionState`, `useTransition`).
- **Styling**: Tailwind CSS v4 + minimal CSS Modules with `@apply` and `@reference`.
- **Auth**: Auth.js / NextAuth v5 beta with JWT session tokens and refresh rotation. All roles authenticate against Pythia 2.0 API (`POST /auth/login`).
- **Billing & Stripe**: Stripe Node SDK (`stripe`) + `/billing/manage-subscription-url` for hosted Customer Portal session creation and subscription management.
- **HTTP**: Axios via custom `pythia2Client` instance (no TanStack Query / React Query).
- **State**: Zustand stores (`userStore`, `swagStore`, `adminConfigStore`, `staffingStore`, `tenantStore`).
- **Forms & Validation**: `react-hook-form` via shared `DynamicForm` with Zod validation schemas (`auth`, `employee`, `manager`, `tenant`, `swag`, `investor-share`).
- **PDF & Canvas**: `html2canvas-pro` + `jspdf` for sectioned A4 multi-page document export.

---

## Styling — Tailwind CSS v4
- **Use Tailwind utility classes directly in `.tsx` files by default.**
- Use CSS Modules with `@apply` sparingly — only for genuine reuse/abstraction: shared button variants used across multiple pages, `@keyframes` animations, `::before`/`::after` pseudo-elements, and complex selectors that can't be expressed inline (`:nth-child`, descendant rules like `strong` inside dynamic JSX content).
- CSS Module files that use `@apply` must start with `@reference "../../app/globals.css";` (adjust relative path per depth).
- Design tokens (`bg-canvas`, `bg-surface`, `bg-surface-alt`, `bg-primary`, `text-accent`, `text-accent-mid`, `bg-accent`, `bg-accent-light`, `border-border`, `border-border-subtle`, `text-danger`, `bg-danger`, `text-warning`, `bg-warning`) are defined in `src/app/globals.css` under `@theme inline` and work as Tailwind utility classes directly in TSX.
- Brand assets live in `public/`:
  - `public/pythia-icon.png` (512×512 full-bleed solid RGB `#1A1714` background for Stripe Icon upload with zero white corner artifacts).
  - `public/pythia-icon.svg` (Full-bleed vector icon).
  - `public/pythia-logo.png` & `public/pythia-logo.svg` (Horizontal logo with squircle icon and "Pythia Scorecard" wordmark).
  - `public/icons/`: Standard 24×24 standalone SVGs for sidebar navigation (`overview`, `stores`, `users`, `coaching`, `staffing`, `roi-attribution`, `benchmarking`, `device-health`).

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
- **Unified Login**: All roles (`employee`, `manager`, `owner`, `superadmin`) authenticate through `pythia2Client.post('/auth/login', { userid_email_or_mobile, password, role })`.
- Standard development test accounts (password `Inx@!123`):
  - Employee: `test_employee@yopmail.com`
  - Manager: `test_manager@yopmail.com`
  - Owner: `dinal.p@inheritx.com`
- **Session shape** (`src/types/next-auth.d.ts`):
  - `role`: `'employee' | 'manager' | 'owner' | 'superadmin'`
  - `initials`: user initials string (e.g. `'MR'`)
  - `token` / `pythia2Token`: API Bearer token string
  - `refreshToken`: token sent to `POST /auth/refresh` on 401s
  - `score`: baseline employee performance score
  - `jobTitle`: job title string (e.g. `'Store Manager'`)
  - `points`: employee swag points balance
  - `tenantId` / `tenantName` / `tenantCode`: optional multi-tenant organization identifiers
  - `store_ids` / `storeIds`: list of store IDs accessible to the user
  - `can_manage_subscription`: boolean indicating if owner/co-owner can access Stripe billing
  - `is_root_owner`: boolean indicating if the user is the primary organization owner
- `NEXTAUTH_SECRET` must be set in `.env.local`.
- `SessionProvider` is mounted in the root layout (`src/providers/SessionProvider.tsx`) so `useSession()` works in all client components.

---

## Server Actions
- Server actions live in `src/actions/` as `'use server'` files, one file per domain:
  - `src/actions/auth.ts`: `login()` posts credentials to API `POST /auth/login` and invokes Auth.js `signIn('credentials', ...)`; `loginTenant()` handles org-scoped multi-tenant login; `logout()` calls Auth.js `signOut()`; `forgotPassword()` and `resetPassword()`.
  - `src/actions/stripe.ts`: `createStripeCustomerPortalSession(returnUrl?: string)` invokes Stripe Billing Portal API or API endpoint `/billing/manage-subscription-url` and returns hosted portal session URL for Owners to manage subscriptions and payment methods.
- Server actions bridge client components and server logic. A file cannot mix `'use client'` and `'use server'`.
- Client components wire actions via `useActionState(action, initialState)` or execute inside `useTransition`.

---

## Role-Based Routing & Next.js 16 Proxy (`src/proxy.ts`)
- `src/proxy.ts` enforces authentication and role-based route access on every request.
  - **Note:** Next.js 16 renamed `middleware.ts` → `proxy.ts` and `export function middleware` → `export function proxy`. Always use `proxy.ts` and the `proxy` export.
- Unauthenticated requests to protected pages redirect to `/login/employee?redirectTo=<path>` (or `/login/tenant` if multi-tenant enabled). Public routes are `/login/employee`, `/login/manager`, `/login/owner`, `/login/superadmin`, `/login/tenant`, `/forgot-password`, `/reset-password`.
- Authenticated requests to `/` or `/login` redirect to the role's `ROLE_DEFAULT_ROUTES[role]`.
- Accessing a route outside a role's allowed prefix redirects to the default page.
- Role → allowed route prefixes → default route:
  | Role         | Allowed Prefixes           | Default Route                     | Dedicated Login Route      |
  |--------------|----------------------------|-----------------------------------|----------------------------|
  | `employee`   | `/dashboard`               | `/dashboard/overview`             | `/login/employee`          |
  | `manager`    | `/manager`                 | `/manager/employees`              | `/login/manager`           |
  | `owner`      | `/owner`, `/manager`       | `/owner/stores` (MT) / `/owner/roi-attribution` | `/login/owner`             |
  | `superadmin` | `/super-admin`             | `/super-admin/tenants` (MT) / `/super-admin/kpi-visibility` | `/login/superadmin`        |
- Owners oversee managers and can access all `/manager/*` routes as well as `/owner/*`. Managers cannot access `/owner/*`.
- **Multi-Tenant Feature Gate**: When `NEXT_PUBLIC_ENABLE_MULTI_TENANT="true"` (or `"1"`), enables `/login/tenant`, `/super-admin/tenants`, `/super-admin/owners`, and `/super-admin/onboarding`. When disabled, these routes are blocked by `proxy.ts`.
- **Dynamic KPI Visibility Route Enforcement**: `proxy.ts` derives `PAGE_HREF_TO_FIELD_ID` from `PAGE_REGISTRY`. If an authenticated user attempts to access a page that has been disabled in the Super Admin KPI visibility settings (`GET /super-admin/field-config`), the proxy intercepts the request and redirects them to their role's default route. It fails open on fetch errors to ensure platform resiliency.

---

## Role-Based Sidebar & Dynamic Navigation
- User identity comes from the **session**, not a static constant.
- `Sidebar.tsx` receives `user: User` prop from the server-side role layout (`await auth()`).
- Navigation sections and bottom widgets per role:
  - `employee`: Overview, Coaching, Progress, Leaderboard, Swag Store (`/dashboard/swag`) + employee score & points pill (`currentScore ?? user.score`).
  - `manager`: Navigate (Dashboard, Employees) + Manager Tools (Coaching Tracker, Staffing, Unknown Identity, Video Identities, Swag Store, Orders) + store status pill.
  - `owner`: Stores (`/owner/stores`), Managers (`/owner/managers`), Employees (`/owner/employees`), Co-Owners (`/owner/owners`), Swag Store (`/owner/swag-store`), ROI Attribution, Benchmarking, Marketing Loop + Owner/Manager view switcher + store status pill.
  - `superadmin`: 4-Way View Switcher (`Admin`, `Manager View`, `Employee View`, `Owner View`) with bidirectional URL sync and read-only mirror pages. Admin navigation includes KPI Visibility, Device Health, Post-Demo Recaps (`/super-admin/post-demo-recaps`), plus Onboarding, Tenants, and Owners when multi-tenant is enabled.
- The store pill (`storeName`, `location`) in Sidebar comes from `useUserStore(s => s.currentStore)` (Zustand).
- **Header Store & Tenant Selectors**: Store selector dropdown renders for `owner`, `manager`, and `superadmin` when stores exist (`role !== 'employee' && stores.length > 0`). When multi-tenant mode is enabled, the Header also renders the Tenant Switcher dropdown.

---

## Super Admin — KPI Visibility & Live Mirror Pages
- **KPI Visibility Tool** at `/super-admin/kpi-visibility` (`KpiVisibilityPanel.tsx`): toggle individual cards/graphs/panels or entire pages on/off.
  - Registry: `src/lib/admin-config-data.ts` (`KPI_IDS`, `PAGE_IDS`, `KPI_REGISTRY`, `PAGE_REGISTRY`, `PAGE_ID_BY_HREF`).
  - Store: `src/store/adminConfigStore.ts` backed by `GET /super-admin/field-config` and `PUT /super-admin/field-config/{role}`.
- **Read-Only Mirror Pages**:
  - **Manager Mirrors**: `/super-admin/manager/{dashboard,employees,coaching-tracker,staffing-intelligence,unknown-identities,video-identities,orders,swag-store}`.
  - **Owner Mirrors**: `/super-admin/owner/{roi-attribution,benchmarking,marketing-loop,stores,employees,managers,owners,swag-store}`.
  - **Employee Mirror**: `/super-admin/employee/{overview,swag}`.
- Mirror pages do NOT pass `previewMode`, so admin-configured visibility toggles remain active in mirrors.

---

## HTTP Client — Axios (`src/lib/api-client.ts`)

All real API calls go through the `pythia2Client` axios instance. Never use `fetch` directly in server actions or query functions.

```ts
import { pythia2Client } from '@/lib/api-client'
```

- **Base URL**: Configured via `process.env.NEXT_PUBLIC_PYTHIA_2_API_URL`. Includes headers for JSON content and `ngrok-skip-browser-warning: true`.
- **401 Response Interceptor (Token Refresh Rotation)**:
  1. Catches 401 on requests carrying a Bearer token.
  2. Coalesces concurrent 401s into a single `POST /auth/refresh` call using `session.user.refreshToken`.
  3. On success, calls `signIn('credentials', { redirect: false })` with updated access and refresh tokens, and retries the original request.
  4. On failure or missing refresh token, signs out and redirects to the role login page.

---

## API Endpoints (`src/utils/api-endpoints.ts`)

Endpoints registered in `PYTHIA_2_API`:
- **`auth`**: `login`, `loginTenant`, `refresh`, `forgotPassword`, `resetPassword`, `p1Profile`
- **`dashboard`**: `summary`, `shiftSummaryHighlights`
- **`demographics`**: `ageDistribution`, `genderDistribution`, `customerSegments`
- **`benchmarking`**: `allStoreData`, `networkIntelligence`
- **`roi`**: `attribution`, `shareWithInvestor`
- **`billing`**: `manageSubscriptionUrl`
- **`coaching`**: `moments`
- **`employees`**: `list`, `create`, `archived`, `detail(id)`, `credentials(id)`, `archive(id)`, `unarchive(id)`
- **`managers`**: `list`, `create`, `archived`, `detail(id)`, `credentials(id)`, `archive(id)`, `unarchive(id)`
- **`unknownIdentities`**: `list`, `count`, `trashed`, `assign(id)`, `trash(id)`, `restore(id)`
- **`videoIdentities`**: `list`, `stats`, `presign`
- **`managerCoaching`**: `signals`, `signal(planId)`, `summary`, `effectiveness`, `employees`, `employeeDetail(userId)`
- **`managerDashboard`**: `summary`, `leaderboard`, `trend`
- **`superAdmin`**: `fieldConfig`, `fieldConfigForRole(roleName)`, `demos`, `manualSend`, `bulkTrigger`, `sentStatus`
- **`deviceHealth`**: `list`, `detail(deviceId)`, `ws`
- **`staffing`**: `schedule`, `scheduleGenerate`, `scheduleEntry(shiftId)`, `schedulePublish`, `roster`, `trafficHeatmap`, `insights`, `recommendations`, `recommendationsGenerate`, `recommendationApply(id)`, `recommendationDismiss(id)`
- **`tenants`**: `list`, `create`, `detail(id)`, `status(id)`, `checklist(id)`
- **`stores`**: `list`, `create`, `bulkCreate`, `detail(id)`, `activate(code)`, `deactivate(code)`, `heartbeat(id)`, `pairingCode(id)`
- **`owners`**: `list`, `create`, `archived`, `detail(id)`, `credentials(id)`, `archive(id)`, `unarchive(id)`
- **`onboarding`**: `wizardState(tenantId)`, `stepUpdate(tenantId)`, `complete(tenantId)`
- **`organizationOwners`**: `list`, `create`, `deactivate(userId)`, `credentials(userId)`, `subscriptionPermission(userId)`
- **`swagStore`**: `rewards`, `reward(id)`, `archiveReward(id)`, `unarchiveReward(id)`, `redemptions`, `myRedemptions`, `fulfillRedemption(id)`, `rejectRedemption(id)`, `cancelRedemption(id)`, `stats`

---

## Query Modules (`src/queries/`)

Every domain has a dedicated query module exporting pure async functions using `pythia2Client`:
1. **`admin-config.ts`**: `fetchFieldConfigs`, `updateFieldConfig`.
2. **`benchmarking.ts`**: `fetchAllStoreData`, `fetchNetworkIntelligence`.
3. **`billing.ts`**: `fetchManageSubscriptionUrl`.
4. **`demographics.ts`**: `fetchAgeDistribution`, `fetchGenderDistribution`, `fetchCustomerSegments`.
5. **`device-health.ts`**: `fetchDeviceStates`, `fetchDeviceDetail`, `getDeviceStatesWsUrl`.
6. **`employees.ts`**: `fetchEmployees`, `createEmployee`, `fetchArchivedEmployees`, `fetchEmployee`, `fetchEmployeeCredentials`, `archiveEmployee`, `unarchiveEmployee`.
7. **`manager-coaching.ts`**: `fetchManagerCoachingPlans`, `fetchManagerCoachingPlan`, `applyManagerPlanAction`, `fetchCoachingSummary`, `fetchCoachingEffectiveness`, `fetchCoachingEmployees`, `fetchEmployeeCoachingDetail`.
8. **`manager-dashboard.ts`**: `fetchManagerDashboardSummary`, `fetchManagerDashboardLeaderboard`, `fetchManagerDashboardTrend`.
9. **`managers.ts`**: `fetchManagers`, `fetchArchivedManagers`, `createManager`, `fetchManagerCredentials`, `archiveManager`, `unarchiveManager`.
10. **`onboarding.ts`**: `fetchOnboardingWizardState`, `updateOnboardingStep`, `completeOnboarding`.
11. **`organization-owners.ts`**: `fetchOrganizationOwners`, `createOrganizationOwner`, `deactivateOrganizationOwner`, `fetchOrganizationOwnerCredentials`, `toggleSubscriptionPermission`.
12. **`overview.ts`**: `fetchOverview`.
13. **`owner-roi.ts`**: `fetchRoiAttribution`, `shareRoiAttributionPdf`.
14. **`owners.ts`**: `fetchOwners`, `fetchArchivedOwners`, `createOwner`, `fetchOwnerCredentials`, `archiveOwner`, `unarchiveOwner`.
15. **`recaps.ts`**: `fetchDemos`, `manualSendRecap`, `bulkTriggerRecap`, `fetchSentStatus`.
16. **`scorecard.ts`**: `fetchDashboardSummary`, `fetchShiftHighlights`, `fetchCoachingMoments`.
17. **`staffing.ts`**: `fetchStaffingSchedule`, `createStaffingShift`, `updateStaffingShift`, `deleteStaffingShift`, `generateStaffingSchedule`, `publishStaffingSchedule`, `fetchStaffingRoster`, `fetchStaffingHeatmap`, `fetchStaffingInsights`, `fetchStaffingRecommendations`, `generateStaffingRecommendations`, `applyStaffingRecommendation`, `dismissStaffingRecommendation`.
18. **`stores.ts`**: `fetchStoresForTenant`, `fetchDeactivatedStores`, `deactivateStore`, `activateStore`, `createStore`, `bulkCreateStores`, `simulateStoreHeartbeat`, `updateStore`, `fetchPairingCode`.
19. **`swag-store.ts`**: `fetchRewards`, `createReward`, `updateReward`, `archiveReward`, `unarchiveReward`, `deleteReward`, `fetchRedemptions`, `fetchMyRedemptions`, `redeemReward`, `fulfillRedemption`, `rejectRedemption`, `cancelRedemption`, `fetchSwagStats`.
20. **`tenants.ts`**: `fetchTenants`, `fetchTenantDetail`, `createTenant`, `updateTenantStatus`, `updateTenantChecklist`.
21. **`unknown-identities.ts`**: `fetchUnknownIdentities`, `fetchUnknownIdentitiesCount`, `fetchTrashedIdentities`, `assignUnknownIdentity`, `trashUnknownIdentity`, `restoreUnknownIdentity`.
22. **`video-identities.ts`**: `fetchVideoIdentities`, `fetchVideoIdentityStats`, `presignVideoIdentityKeys`.

---

## State Management — Zustand Stores (`src/store/`)

1. **`userStore.ts`**:
   - Holds `stores: Store[]`, `currentStore: Store | null`, `currentScore: number | null`, `points: number | null`.
   - Actions: `setStores`, `setCurrentStore`, `setCurrentScore`, `setPoints`.
   - Subscriptions: `onStoreChange((next, prev) => ...)` coordinate refetches across views when the active store changes.
2. **`swagStore.ts`**:
   - Complete reward and order management store for employees, managers, and owners.
   - Holds `catalog: SwagReward[]`, `myRedemptions: SwagRedemption[]`, `managerRedemptions: SwagRedemption[]`, `stats: SwagStats | null`, `loading`, `redeemingId`, `actionInProgressId`, `error`.
   - Actions: `fetchCatalog`, `fetchMyRedemptions`, `fetchManagerRedemptions`, `fetchStats`, `redeemReward` (updates employee points balance), `createReward`, `updateReward`, `archiveReward`, `unarchiveReward`, `deleteReward`, `fulfillOrder`, `rejectOrder`, `cancelOrder`.
3. **`adminConfigStore.ts`**:
   - Holds `visibility: Record<string, boolean>`, `fieldsByRole: Record<string, Record<string, boolean>>`, `loading`, `savingId`, `error`.
   - Actions: `fetchVisibility`, `setCardVisibility`.
4. **`staffingStore.ts`**:
   - Holds `schedule`, `roster`, `heatmap`, `insights`, `recommendations`, `criticalAlert`, `generationStatus`, `pollingRecommendations`, `savingShift`, `publishing`.
   - Actions: `hydrate`, `fetchAll`, `saveShift`, `deleteShift`, `generateSchedule`, `publishSchedule`, `generateRecommendations` (polls async batch jobs), `applyRecommendation`, `applyAllRecommendations`, `dismissRecommendation`.
5. **`tenantStore.ts`**:
   - Holds `tenants: Tenant[]`, `currentTenant: Tenant | null`, `loading`, `stats: TenantStats | null`.
   - Utility: `isMultiTenantEnabled()` checks `NEXT_PUBLIC_ENABLE_MULTI_TENANT === 'true'`.

---

## Custom Hooks (`src/hooks/`)
- **`useDashboardSummary`**: Handles week navigation (offsets 0 and 1), SSR initial data hydration, AbortController cancellation, and week label formatting.
- **`useShiftHighlights`**: Fetches AI-generated shift summary highlights based on `shiftStart` and `shiftStatus` with `isFirstRun` hydration guards.
- **`useStalledCoachingPlans`**: Fetches open/in-progress manager coaching plans, resolves employee display names, computes stalled plan counts, and provides `patchPlan` local state updates.

---

## Key Feature Architectures

### Swag Store & Rewards
- **Employee View** (`/dashboard/swag`): Browse active reward items, redeem points balance for rewards, and track past order statuses (`pending`, `fulfilled`, `rejected`, `cancelled`).
- **Manager Orders** (`/manager/orders`): Review employee redemption orders, fulfill orders with confirmation, or reject orders with a stated reason.
- **Owner Rewards Catalog** (`/owner/swag-store`): Full reward lifecycle management — create new rewards, edit points cost/inventory, archive/unarchive rewards, or delete rewards with zero active orders.

### Co-Owner & Owner Management
- Dedicated page at `/owner/owners` (`OwnerManagementPanel.tsx`) backed by `src/queries/organization-owners.ts`.
- Primary ("root") owners can invite sub-owners (`CreateSubOwnerModal`), view generated credentials, deactivate access, and toggle Stripe subscription billing delegation (`toggleSubscriptionPermission`).

### Stripe Billing & Subscription Management
- Hosted Customer Portal session creation via `createStripeCustomerPortalSession` (`src/actions/stripe.ts`) or API endpoint `/billing/manage-subscription-url`.
- Accessible from `Header.tsx` profile dropdown for owners and authorized co-owners (`can_manage_subscription === true`).

### Store & Date Filtering
- Multi-store selection in `Header.tsx` synchronizes `currentStore` across `userStore`.
- Date range filtering (`DatePicker.tsx`) wired across Manager Dashboard panels (`/manager/dashboard`), employee stats, and ROI Attribution views.

### Post-Demo Recaps (Super Admin)
- Page at `/super-admin/post-demo-recaps` (`PostDemoRecaps.tsx`) backed by `src/queries/recaps.ts`.
- Manages sending follow-up summary emails after demo sessions (`POST /super-admin/manual-send`, `/super-admin/bulk-trigger`).

### Multi-Tenant Architecture & Onboarding
- Feature-flagged multi-tenant organization directory and isolation (`NEXT_PUBLIC_ENABLE_MULTI_TENANT`).
- Onboarding Wizard (`src/components/OnboardingWizard/` at `/super-admin/onboarding`): Multi-step setup for tenant details, stores, edge device pairing, owners, and managers.

### Video Identities & Unknown Identities
- Unknown face crop review carousel with pagination, employee assignment modal, soft-trash, and trash restoration.
- S3 presigned asset resolution: `presignVideoIdentityKeys` resolves secure temporary playback URLs on demand only when a video/crop is opened.

### Super Admin Device Health (WebSockets)
- Hybrid REST + WebSocket architecture at `/super-admin/device-health`.
- Instant initial snapshot via `fetchDeviceStates`.
- Live WebSocket stream (`GET /device-states/ws`) authenticated via in-socket handshake JSON (`{ token }`) on `onopen`.

### Owner ROI Attribution & PDF Export
- Dynamic correlation line charts (`ScoreVsTransactions`, `HospitalityVsDwell`, `CheckoutSpeed`) mapped via `src/utils/roi-chart-mapper.ts`.
- Multi-page non-breaking A4 PDF generation via `generateSectionedPdf` in `src/utils/pdf-export.ts` (`html2canvas-pro` + `jspdf`). Uses JPEG quality 0.92 to keep attachment sizes under 15MB.
- Multipart email dispatch via `shareRoiAttributionPdf` (`POST /roi/attribution/share`).

---

## Forms, Validation & Modals
- **Forms**: Always use `DynamicForm` (`src/components/shared/DynamicForm/DynamicForm.tsx`).
- **Validation Schemas (`src/schemas/`)**: `auth.ts`, `employee.ts`, `manager.ts`, `tenant.ts`, `swag.ts`, `investor-share.ts`.
- **Status Modals**: Standardize status screens with `SuccessPage` (`src/components/shared/Modals/Success.tsx`) and `ErrorModal` (`src/components/shared/Modals/Error.tsx`).
- **Action Modals**:
  - `CreateEmployeeModal`, `CreateManagerModal`, `CreateOwnerModal`, `CreateSubOwnerModal`
  - `CreateStoreModal`, `EditStoreModal`, `ConfirmDeactivateStoreModal`
  - `RevealCredentialsModal`
  - `ConfirmArchiveEmployeeModal`, `ConfirmArchiveManagerModal`, `ConfirmArchiveOwnerModal`
  - `StalledPlansModal`
  - `CreateSwagProductModal`, `ConfirmArchiveProductModal`, `ConfirmDeleteProductModal`, `CannotDeleteProductModal`
  - `ConfirmFulfillOrderModal`, `RejectOrderModal`, `ConfirmCancelOrderModal`

---

## Data Fetching & Strict Rules

1. **NO TanStack Query / React Query**: Plain `async`/`await` in server components and `useState` + `useEffect` in client components.
2. **Server Fetching Rethrow Rule**:
   - Sequential `try/catch`: Always call `unstable_rethrow(err)` from `next/navigation` as the first line of `catch` to avoid swallowing Next.js redirect exceptions.
   - `Promise.allSettled`: Loop through rejected results and call `unstable_rethrow(result.reason)`.
3. **Client Fetching Rule**: Guard against race conditions and memory leaks with `cancelled` boolean and `AbortController`.
4. **Loading Skeletons**: Every `page.tsx` must have a co-located `loading.tsx` using `bg-border` and `animate-pulse`.
<!-- END:project-conventions -->
