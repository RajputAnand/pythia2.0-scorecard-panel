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
- Change `DEMO_USER.role` to `'employee'`, `'owner'`, or `'manager'` to test different sidebar layouts.
- `Sidebar.tsx` reads `DEMO_USER` and renders role-specific nav sections and bottom widget:
  - `employee` → "My Dashboard" nav + employee score pill
  - `owner` / `manager` → "Navigate" + "Owner Tools" nav + view toggle + store pill

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
- Components import from `src/lib/` and pass the constant to `useState` — no inline data literals in component files.

## Shared Components
- When two or more components share a non-trivial piece of UI (e.g. a reusable SVG chart, a card shell, a data table), extract it into its own component under `src/components/shared/<SharedComponentName>/`.
- The shared component receives all variable content via props — it must not import any page-specific data or types directly.
- Define the props interface in `src/types/` using a domain-appropriate filename (e.g. `src/types/line-chart.ts` for a line chart component).
- The consuming components each own their own data file in `src/lib/` and pass it through `useState` as usual — the shared component only renders what it receives.
- **Example:** `src/components/shared/LineChartSvg/LineChartSvg.tsx` — renders a multi-series SVG line chart; used by both `ProgressChart` and `ScoreVsTransactions`, each supplying its own data via `LineChartSvgProps`.

## Routes
- All pages are under `/dashboard/<page-name>/` (e.g. `/dashboard/roi-attribution`).
- The employee overview page is at `/dashboard/overview` — not at `/`.
<!-- END:project-conventions -->
