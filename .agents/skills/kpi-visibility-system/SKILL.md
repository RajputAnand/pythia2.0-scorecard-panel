---
name: kpi-visibility-system
description: >-
  Guide for registering, wiring, previewing, and enforcing KPI cards, panels, and whole pages in the Pythia 2.0 Super Admin KPI Visibility system.
---

# KPI Visibility System Guide

The KPI Visibility System enables Super Admins to dynamically control which cards, graphs, panels, and whole pages are visible to `employee`, `manager`, and `owner` roles across the application.

## Core Files & Locations

- **Registry Definition**: [`src/lib/admin-config-data.ts`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/lib/admin-config-data.ts)
  - `KPI_IDS`: Stable string IDs for every individual card/graph/panel.
  - `PAGE_IDS`: Stable string IDs for page-level sidebar toggles.
  - `KPI_REGISTRY`: Array of `{ id, label, description, type, role, page, pageHref }`.
  - `PAGE_REGISTRY`: Array of `{ id, role, page, pageHref }`.
  - `PAGE_ID_BY_HREF`: Lookup mapping route href to page ID.
  - `ROLE_BY_FIELD_ID`: Lookup mapping any field ID to its owning `AdminRole`.
- **State Store**: [`src/store/adminConfigStore.ts`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/store/adminConfigStore.ts)
  - `visibility: Record<string, boolean>`
  - `fieldsByRole: Record<string, Record<string, boolean>>`
  - `fetchVisibility(token)`: Loads all field configs from `GET /super-admin/field-config`.
  - `setCardVisibility(token, id, visible)`: Updates a field toggle via `PUT /super-admin/field-config/{role}`.
- **Admin UI**: [`src/components/KpiVisibilityPanel/KpiVisibilityPanel.tsx`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/components/KpiVisibilityPanel/KpiVisibilityPanel.tsx)
- **Previews**: [`src/components/KpiVisibilityPanel/kpiPreviews.tsx`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/components/KpiVisibilityPanel/kpiPreviews.tsx) and [`src/lib/kpi-preview-data.ts`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/lib/kpi-preview-data.ts).
- **Route Gate**: [`src/proxy.ts`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/proxy.ts) (`isPageHiddenByAdmin`).
- **Sidebar Enforcement**: [`src/components/shared/Sidebar/Sidebar.tsx`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/components/shared/Sidebar/Sidebar.tsx).

---

## Step-by-Step: Registering a New KPI Card / Panel

### 1. Add ID to `KPI_IDS`
In `src/lib/admin-config-data.ts`:
```ts
export const KPI_IDS = {
  // ... existing
  myNewCard: 'managerDashboard.myNewCard',
} as const
```

### 2. Add Registry Entry to `KPI_REGISTRY`
In `src/lib/admin-config-data.ts`:
```ts
{
  id: KPI_IDS.myNewCard,
  label: 'My New Card Title',
  description: 'Explains what this metric measures.',
  type: 'card', // 'card' | 'graph' | 'panel'
  role: 'manager',
  page: 'Dashboard',
  pageHref: '/manager/dashboard',
}
```

### 3. Wire Component for Visibility
Components support two integration patterns:

#### Pattern A: Coarse Component (Whole Component Toggle)
Use when the component is a single card, chart, or banner:
```tsx
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'

export default function MyNewCard({ previewMode = false }: { previewMode?: boolean }) {
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.myNewCard] ?? true)
  if (!previewMode && !visible) return null

  return <div className="card-container">...</div>
}
```

#### Pattern B: Fine-Grained Component (Multi-Card Strip)
Use when a single component renders an array of independent cards:
```tsx
export default function MetricStrip({
  previewMode = false,
  highlightId,
}: {
  previewMode?: boolean
  highlightId?: string
}) {
  const visibility = useAdminConfigStore((s) => s.visibility)
  
  const allCards = [
    { id: KPI_IDS.cardOne, title: 'Card 1', value: 92 },
    { id: KPI_IDS.cardTwo, title: 'Card 2', value: 45 },
  ]

  const visibleCards = previewMode
    ? allCards
    : allCards.filter((card) => visibility[card.id] ?? true)

  if (visibleCards.length === 0) return null

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${visibleCards.length}, 1fr)` }}
    >
      {visibleCards.map((card) => {
        const isDimmed = highlightId && highlightId !== card.id
        return (
          <div
            key={card.id}
            className={`card ${isDimmed ? 'opacity-30' : 'opacity-100'}`}
          >
            {card.title}
          </div>
        )
      })}
    </div>
  )
}
```

### 4. Register Preview in `kpiPreviews.tsx`
Add realistic mock data in `src/lib/kpi-preview-data.ts`, then map in `src/components/KpiVisibilityPanel/kpiPreviews.tsx`:
```tsx
case KPI_IDS.myNewCard:
  return <MyNewCard previewMode={true} />
```

### 5. Backend Alignment
Add the `(field_id, role)` pair to `pythia-2.0/scripts/seed_field_configs.py` so the field is seeded into MongoDB `ui_field_config`. Default value should always be `true`.

---

## Step-by-Step: Registering a New Sidebar Page

1. **Add to `PAGE_IDS`** in `src/lib/admin-config-data.ts`.
2. **Add to `PAGE_REGISTRY`** with `{ id, role, page, pageHref }`.
3. `Sidebar.tsx` will automatically filter the sidebar navigation link when `visibility[pageId] === false`.
4. `proxy.ts` (`isPageHiddenByAdmin`) will automatically block direct URL access to the page and redirect the user to their role default route.

