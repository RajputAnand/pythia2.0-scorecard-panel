---
name: component-and-styling-guide
description: >-
  Guide for creating and styling UI components using Tailwind CSS v4, CSS Modules with @apply and @reference, page assembler patterns, loading skeletons, and design tokens in Pythia 2.0.
---

# Component & Styling Guide

This guide outlines UI architecture, Tailwind CSS v4 conventions, component breakdown rules, and loading skeletons for Pythia 2.0.

## Styling Rules — Tailwind CSS v4

- **Tailwind v4 In-line Classes**: Use Tailwind utility classes directly in `.tsx` files by default.
- **Design Tokens**: Defined in [`src/app/globals.css`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/app/globals.css) under `@theme inline`:
  - Backgrounds: `bg-canvas`, `bg-surface`, `bg-surface-alt`, `bg-primary`
  - Accents: `text-accent`, `text-accent-mid`, `bg-accent`, `bg-accent-light`
  - Statuses: `text-danger`, `bg-danger`, `text-warning`, `bg-warning`
  - Borders: `border-border`, `border-border-subtle`
- **CSS Modules with `@apply`**:
  - Use sparingly — only for shared multi-page button variants, `@keyframes`, `::before`/`::after`, or pseudo-selectors like `:nth-child`.
  - **Required Header**: Any `.module.css` using `@apply` **must** begin with `@reference` pointing to `globals.css`:
    ```css
    @reference "../../app/globals.css";

    .customBtn {
      @apply inline-flex items-center justify-center font-medium rounded-lg transition-colors;
    }
    ```

---

## Component Architecture & Page Assembler Pattern

### Directory Structure
Each component lives in its own dedicated directory:
```text
src/components/MySection/
├── MySection.tsx          # Component logic and markup
└── MySection.module.css   # Optional: pseudo-selectors, animations, @apply
```

### Clean Page Assembler Convention
`page.tsx` must be a clean assembler. **Never put inline layout markup or raw UI blocks in `page.tsx`**:
```tsx
// src/app/manager/my-feature/page.tsx
import Header from '@/components/shared/Header/Header'
import MyFeaturePanel from '@/components/MyFeaturePanel/MyFeaturePanel'
import { auth } from '@/auth'
import { fetchFeatureData } from '@/queries/feature'

export default async function MyFeaturePage() {
  const session = await auth()
  const token = session?.user?.pythia2Token

  const initialData = token ? await fetchFeatureData({ token }) : null

  return (
    <>
      <Header title="Feature Name" subtitle="Manager Tools" />
      <div className="px-[30px] py-[26px]">
        <MyFeaturePanel initialData={initialData} />
      </div>
    </>
  )
}
```

---

## Mandatory Loading Skeletons (`loading.tsx`)

Every route that has a `page.tsx` **must** have a co-located `loading.tsx`:
```tsx
// src/app/manager/my-feature/loading.tsx
import Header from '@/components/shared/Header/Header'

export default function Loading() {
  return (
    <>
      <Header title="Feature Name" subtitle="Manager Tools" />
      <div className="px-[30px] py-[26px] animate-pulse">
        <div className="bg-surface border border-border rounded-[14px] p-6 h-[400px]">
          <div className="h-6 w-48 bg-border rounded mb-4" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-border rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
```

- Always use `bg-border` for placeholder boxes.
- Always add `animate-pulse` on wrapper.
- Never do async work or import live data into `loading.tsx`.

---

## Header & Subheader Toolbar Pattern

### Header (`src/components/shared/Header/Header.tsx`)

Pass simple page-level action buttons (1–2 buttons) as `children` to `<Header>`:
```tsx
import Header from '@/components/shared/Header/Header'
import headerStyles from '@/components/shared/Header/Header.module.css'

<Header title="Title" subtitle="Subtitle">
  <button className={headerStyles.btnGhost}>Export</button>
  <button className={headerStyles.btnAccent}>New Shift</button>
</Header>
```

### Reusable Toolbar (`src/components/shared/Toolbar/Toolbar.tsx`)

Whenever a page has contextual filters, metric tabs, date pickers, or employee selectors, **do not pack them into `<Header>`** (which causes horizontal layout overflow when global Organization/Store selectors are rendered). Instead, place `<Toolbar>` directly beneath `<Header>`:

```tsx
import Header from '@/components/shared/Header/Header'
import Toolbar from '@/components/shared/Toolbar/Toolbar'

<Header title="Employee Overview" subtitle="Super Admin" />
<Toolbar
  left={
    <div className="flex items-center gap-2 flex-wrap">
      <EmployeeSelector ... />
      <WeekNavButtons ... />
    </div>
  }
  right={
    <div className="flex items-center gap-2 shrink-0">
      <DatePicker ... />
      <span>to</span>
      <DatePicker ... />
      <button ...>Clear filter</button>
    </div>
  }
/>
```

### Standard Implementations
- **Staffing Intelligence** (`StaffingToolbar.tsx`): Week indicator badge + previous/next week navigation buttons on left, schedule generation / refresh recommendations / publish schedule action buttons on right.
- **Competitor Benchmarking** (`BenchmarkingContent.tsx`): Metric tabs on left, CSV export button on right.
- **ROI Attribution** (`TimeControls.tsx`): Time period pills on left, custom date range and actuals/projected view toggle on right.
- **Employee Overview** (`SuperAdminEmployeeOverviewContent.tsx`, `OverviewContent.tsx`): Employee selector + week navigation on left, date range pickers + clear filter on right.

### Z-Index Stacking & Dropdown Alignment Rules
- **Stacking Hierarchy**:
  - `Sidebar`: `fixed inset-y-0 left-0 z-20`
  - `Header`: `sticky top-0 z-10`
  - `Toolbar`: `sticky top-[58px] z-[9]`
- **Subheader Dropdown Alignment**:
  - Any dropdown trigger positioned in the **left slot** of `Toolbar` (such as `EmployeeSelector`) **must default to left alignment** (`align="left"`, using `left-0`).
  - Using `right-0` on left-aligned triggers causes the menu to expand leftward and clip underneath the `z-20` sidebar.

---

## Forms, Validation & Action Modals

- **Forms**: Always use `DynamicForm` (`src/components/shared/DynamicForm/DynamicForm.tsx`) for standard text/email/password forms. For specialized forms requiring custom controls (e.g. photo uploads, multi-select stores, textareas with guidance notes, or auto-generated pairing codes), use `useForm` + `zodResolver` with standard design token styling.
- **Validation**: Define Zod schemas in `src/schemas/` (`auth.ts`, `employee.ts`, `manager.ts`, `tenant.ts`, `investor-share.ts`).
- **Standard Action Modals**:
  - `CreateEmployeeModal`: Multi-step form with face photo capture and temporary credentials reveal.
  - `CreateManagerModal`: Form with store assignment multi-picker and credentials reveal.
  - `CreateStoreModal`: Form with full physical address input, delivery note, and auto-generated edge device pairing code.
  - `EditStoreModal`: Store location, district, address, and status editor.
  - `ConfirmDeactivateStoreModal` / `ConfirmArchiveManagerModal` / `ConfirmArchiveEmployeeModal` / `ConfirmArchiveOwnerModal`: Destructive action confirmation dialogs with pending states.
---

## Brand Assets & Stripe Branding Guidelines

### Public Brand Assets (`public/`)
- **`public/pythia-icon.png` / `.svg`**: The primary square brand icon (dark `#1A1714` squircle with centered white reticle target).
  - *Stripe Requirement*: Full-bleed solid square RGB `#1A1714` background (no transparent corner padding) so Stripe's container rounds it seamlessly without white corner bleeding.
- **`public/pythia-logo.png` / `.svg`**: Standard horizontal logo with squircle icon and "Pythia Scorecard" wordmark.
- **`public/icons/`**: Standard 24×24 navigation SVGs extracted from Sidebar (`overview`, `stores`, `users`, `coaching`, `staffing`, `roi-attribution`, `benchmarking`, `device-health`).

### Recommended Stripe Palette
- **Brand Color**: `#1A1714` (Executive Dark Charcoal) or `#1D5C3A` (Forest Green CTA).
- **Accent Color**: `#E6F2EC` (Mint) or `#F6F4F1` (Canvas).
- **Button Shape**: `Rounded`.
- **Font**: `System default` or `Inter` (closest standard match to `DM Sans`).
