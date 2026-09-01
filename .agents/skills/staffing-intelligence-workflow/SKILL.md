---
name: staffing-intelligence-workflow
description: >-
  Guide for managing Staffing Intelligence, AI schedule generation, recommendations polling, shift editing, heatmap visualization, and state handling in Pythia 2.0.
---

# Staffing Intelligence Workflow Guide

Staffing Intelligence (`/manager/staffing-intelligence` & `/super-admin/manager/staffing-intelligence`) provides schedule optimization, AI shift generation, traffic heatmaps, and Gemini-powered recommendations.

## Core Files & Locations

- **Page Route**: [`src/app/manager/staffing-intelligence/page.tsx`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/app/manager/staffing-intelligence/page.tsx)
- **State Store**: [`src/store/staffingStore.ts`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/store/staffingStore.ts)
- **Queries**: [`src/queries/staffing.ts`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/queries/staffing.ts)
- **Transforms & Date Helpers**: [`src/lib/staffing-transform.ts`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/lib/staffing-transform.ts)
- **Components**:
  - `StaffingPageContent`: Root coordinator component.
  - `StaffingSchedulePanel`: Interactive weekly schedule grid with drag/drop/click shift editing.
  - `StaffingRecommendations`: Actionable AI recommendations (add shift, swap shift, coverage adjustment).
  - `StaffingInsightStrip`: KPI cards (coverage gaps, fatigue flags, weak pairings, optimized shifts).
  - `StaffingTeamScores`: Team member performance scores and shift allocations.

---

## Store Architecture (`useStaffingStore`)

The staffing store coordinates multi-endpoint hydration and async operations:

### Hydration
The server component fetches initial data with `Promise.allSettled` and passes it to `hydrate()`:
```ts
useStaffingStore.getState().hydrate({
  storeId,
  weekStartDate,
  schedule,
  roster,
  heatmap,
  insights,
  recommendations,
})
```

### AI Generation & Polling Lifecycle
When generating recommendations or full schedules:
1. `generateRecommendations(token)` triggers `POST /staffing/recommendations/generate`.
2. The store enters a polling loop with `POLL_INTERVAL_MS = 2000` and `POLL_MAX_ATTEMPTS = 30` (~60s margin for Gemini batch calls).
3. The store sets `pollingRecommendations: true` so the UI shows active syncing states while preventing redundant calls.
4. Once completed or on timeout, the loop settles and refreshes insights and recommendation lists.

---

## Managing Shifts & Recommendations

### Creating / Updating Shifts
```ts
await saveShift(token, {
  shiftId: 'shift_123', // or null for new shift
  body: {
    store_id: 'store_1',
    employee_id: 'emp_456',
    date: '2026-06-15',
    day_part: 'morning', // 'morning' | 'afternoon' | 'evening'
    paired_with: 'emp_789',
  },
})
```

### Applying / Dismissing Recommendations
```ts
// Apply single recommendation
const success = await applyRecommendation(token, recommendationId)

// Apply all recommendations in bulk
const success = await applyAllRecommendations(token)

// Dismiss recommendation with optional reason
const success = await dismissRecommendation(token, recommendationId, 'Already covered')
```

