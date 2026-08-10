'use client'

import type { ReactNode } from 'react'
import { useAdminConfigStore } from '@/store/adminConfigStore'

// Renders children only if the given KPI/page id is currently visible per
// the Super Admin's KPI Visibility settings — for the rare case where a
// component's own `previewMode` prop can't be used to respect that toggle
// because previewMode is already doing double duty as a sample-data switch
// (e.g. SwagStore, where previewMode also swaps in a static catalog).
export default function KpiVisibilityGate({ id, children }: { id: string; children: ReactNode }) {
  const visible = useAdminConfigStore((s) => s.visibility[id] ?? true)
  if (!visible) return null
  return <>{children}</>
}
