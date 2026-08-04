import { KPI_REGISTRY, PAGE_REGISTRY } from '@/lib/admin-config-data'
import type { KpiVisibilityMap } from '@/types/admin-config'

// Stand-in for a real backend — persists toggles to localStorage so they
// survive a reload. Swap these two functions for real `pythia2Client` calls
// when a visibility endpoint exists; callers (adminConfigStore) only ever
// see `{ visibility }` in / `(id, visible)` out, so nothing else changes.
const STORAGE_KEY = 'pythia2:admin-kpi-visibility'

function readStoredVisibility(): KpiVisibilityMap | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as KpiVisibilityMap) : null
  } catch {
    return null
  }
}

function writeStoredVisibility(visibility: KpiVisibilityMap) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(visibility))
  } catch {
    // Storage unavailable (e.g. private browsing quota) — toggles just won't persist across reloads.
  }
}

export function fakeGetVisibility(): Promise<{ visibility: KpiVisibilityMap }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const defaults: KpiVisibilityMap = {}
      for (const entry of KPI_REGISTRY) defaults[entry.id] = true
      for (const entry of PAGE_REGISTRY) defaults[entry.id] = true

      // Merge over defaults so newly-registered ids default to visible even
      // when an older stored map predates them.
      const stored = readStoredVisibility()
      resolve({ visibility: stored ? { ...defaults, ...stored } : defaults })
    }, 800)
  })
}

export function fakeSetVisibility(id: string, visible: boolean): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      writeStoredVisibility({ ...(readStoredVisibility() ?? {}), [id]: visible })
      resolve()
    }, 400)
  })
}
