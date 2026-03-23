<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-conventions -->
# Project Conventions

## Styling — Tailwind CSS v4 + CSS Modules
- **Never use inline Tailwind classes** in `.tsx` files. Always use CSS Modules.
- Every component has a paired `ComponentName.module.css` using `@apply` directives.
- Every `.module.css` file must start with `@reference "../../app/globals.css";` (adjust relative path per depth).
- Design tokens (`bg-canvas`, `text-accent`, `border-border`, etc.) are defined in `src/app/globals.css` under `@theme inline` and are only accessible via `@reference`.

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

## Routes
- All pages are under `/dashboard/<page-name>/` (e.g. `/dashboard/roi-attribution`).
- The employee overview page is at `/dashboard/overview` — not at `/`.
<!-- END:project-conventions -->
