'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSession } from 'next-auth/react'
import Panel from '@/components/shared/Panel/Panel'
import ToggleSwitch from '@/components/shared/ToggleSwitch/ToggleSwitch'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_REGISTRY, PAGE_REGISTRY } from '@/lib/admin-config-data'
import { getKpiPreview } from './kpiPreviews'
import type { AdminRole, KpiEntryType } from '@/types/admin-config'

// The preview renders each real component at its natural (wide) size, then
// scales it down — so the popup always fits within the visible viewport
// instead of needing to scroll or overflow off-screen. The box's height
// adapts per component (measured after each render) rather than being a
// fixed square that either wastes space or clips content; only width and a
// height ceiling are fixed.
const PREVIEW_SCALE = 0.62
const PREVIEW_DISPLAY_WIDTH = 600
const PREVIEW_PADDING = 12 // matches the p-3 on the popup — subtract it so the
// scaled content's painted width matches the actual inner space, not the
// full outer box (otherwise the padding itself clips the content's right edge).
// Box-shadow / focus-ring effects (e.g. the highlighted-card ring, card hover
// shadows) paint outside a component's layout box, so they aren't included in
// the measured scrollHeight/width used to size the clipping box below — this
// buffer reserves room for that bleed so it isn't cut off on the right/bottom.
const PREVIEW_EFFECT_BUFFER = 12
const PREVIEW_NATURAL_WIDTH = (PREVIEW_DISPLAY_WIDTH - PREVIEW_PADDING * 2 - PREVIEW_EFFECT_BUFFER) / PREVIEW_SCALE
const PREVIEW_MIN_HEIGHT = 90
const PREVIEW_MAX_HEIGHT = 580
const PREVIEW_MARGIN = 12

const ROLES: { role: AdminRole; label: string }[] = [
  { role: 'employee', label: 'Employee' },
  { role: 'manager', label: 'Manager' },
  { role: 'owner', label: 'Owner' },
]

function KpiThumbnail({ type }: { type: KpiEntryType }) {
  if (type === 'graph') {
    return (
      <svg width="30" height="24" viewBox="0 0 30 24" className="shrink-0 rounded-[6px] bg-cobalt-light p-1">
        <polyline points="2,18 9,10 15,14 22,5 28,9" fill="none" stroke="var(--color-cobalt)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (type === 'panel') {
    return (
      <svg width="30" height="24" viewBox="0 0 30 24" className="shrink-0 rounded-[6px] bg-purple-light p-1">
        <rect x="2" y="4" width="26" height="3.5" rx="1" fill="var(--color-purple)" />
        <rect x="2" y="10.5" width="26" height="3.5" rx="1" fill="var(--color-purple)" opacity="0.6" />
        <rect x="2" y="17" width="18" height="3.5" rx="1" fill="var(--color-purple)" opacity="0.35" />
      </svg>
    )
  }
  return (
    <svg width="30" height="24" viewBox="0 0 30 24" className="shrink-0 rounded-[6px] bg-accent-light p-1">
      <rect x="2" y="2" width="26" height="20" rx="2" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" />
      <rect x="5" y="13" width="6" height="6" rx="1" fill="var(--color-accent)" />
      <rect x="14" y="9" width="6" height="10" rx="1" fill="var(--color-accent)" opacity="0.6" />
      <rect x="23" y="6" width="2" height="13" rx="1" fill="var(--color-accent)" opacity="0.35" />
    </svg>
  )
}

export default function KpiVisibilityPanel() {
  const { data: session } = useSession()
  const token = session?.user?.token
  const { visibility, savingId, fetchVisibility, setCardVisibility } = useAdminConfigStore()
  const [activeRole, setActiveRole] = useState<AdminRole>('employee')
  const [selectedPage, setSelectedPage] = useState<string | null>(null)
  const [hover, setHover] = useState<{ id: string; left: number; anchor: 'top' | 'bottom'; offset: number } | null>(null)
  const [previewHeight, setPreviewHeight] = useState(PREVIEW_MIN_HEIGHT)
  const previewContentRef = useRef<HTMLDivElement>(null)

  // Re-measure the (unscaled) natural height of whichever component is being
  // previewed and size the box to match it — runs before paint so there's no
  // flash of the previous item's height.
  useLayoutEffect(() => {
    if (!hover || !previewContentRef.current) return
    const natural = previewContentRef.current.scrollHeight
    setPreviewHeight(Math.max(PREVIEW_MIN_HEIGHT, Math.min(PREVIEW_MAX_HEIGHT, natural * PREVIEW_SCALE + PREVIEW_EFFECT_BUFFER)))
  }, [hover])

  function handleRowEnter(id: string, el: HTMLElement) {
    const r = el.getBoundingClientRect()
    const fitsRight = r.right + PREVIEW_MARGIN + PREVIEW_DISPLAY_WIDTH < window.innerWidth
    const left = fitsRight ? r.right + PREVIEW_MARGIN : Math.max(PREVIEW_MARGIN, r.left - PREVIEW_DISPLAY_WIDTH - PREVIEW_MARGIN)
    // Rows in the lower half of the viewport anchor the preview by its bottom
    // edge (growing upward) instead of its top edge, so a tall preview never
    // gets clipped off the bottom of the screen.
    const openUpward = r.top > window.innerHeight / 2
    const anchor = openUpward ? 'bottom' : 'top'
    const offset = openUpward
      ? Math.max(PREVIEW_MARGIN, window.innerHeight - r.bottom)
      : Math.max(PREVIEW_MARGIN, r.top)
    setHover({ id, left, anchor, offset })
  }

  function handleRowLeave() {
    setHover(null)
  }

  useEffect(() => {
    if (!token) return
    fetchVisibility(token)
  }, [fetchVisibility, token])

  const pagesByRole = useMemo(() => {
    const map = new Map<AdminRole, string[]>()
    for (const entry of KPI_REGISTRY) {
      const pages = map.get(entry.role) ?? []
      if (!pages.includes(entry.page)) pages.push(entry.page)
      map.set(entry.role, pages)
    }
    return map
  }, [])

  const pagesForActiveRole = pagesByRole.get(activeRole) ?? []

  useEffect(() => {
    setSelectedPage(pagesForActiveRole[0] ?? null)
    // Only re-run when the active role changes, not on every registry recompute.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRole])

  const hasLoaded = Object.keys(visibility).length > 0
  // Only count KPI_REGISTRY ids here — the same visibility map also holds the
  // page-level "show in sidebar" ids (PAGE_REGISTRY), which aren't part of
  // the "N of M KPI items visible" summary.
  const totalVisible = KPI_REGISTRY.filter((e) => visibility[e.id] ?? true).length
  const totalCount = KPI_REGISTRY.length

  function countFor(entries: typeof KPI_REGISTRY) {
    const visible = entries.filter((e) => visibility[e.id] ?? true).length
    return { visible, total: entries.length }
  }

  const pageItems = KPI_REGISTRY.filter((e) => e.role === activeRole && e.page === selectedPage)
  const pageHref = pageItems[0]?.pageHref ?? ''
  const pageEntry = PAGE_REGISTRY.find((p) => p.role === activeRole && p.page === selectedPage)
  const pageEnabled = pageEntry ? (visibility[pageEntry.id] ?? true) : true

  return (
    <div className="grid gap-5">
      <div className="text-[12.5px] text-secondary">
        {hasLoaded ? (
          <>
            <span className="font-mono font-semibold text-primary">{totalVisible}</span> of{' '}
            <span className="font-mono font-semibold text-primary">{totalCount}</span> KPI items visible across the app
            <span className="text-muted"> · hover the Preview button on any row to see it with sample data</span>
          </>
        ) : (
          'Loading KPI visibility settings…'
        )}
      </div>

      {/* Step 1 — role tabs */}
      <div className="flex gap-2">
        {ROLES.map(({ role, label }) => {
          const { visible, total } = countFor(KPI_REGISTRY.filter((e) => e.role === role))
          const active = activeRole === role
          return (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`flex items-center gap-2 rounded-[10px] border px-4 py-[9px] text-[13px] font-medium cursor-pointer transition-colors duration-150 ${
                active ? 'bg-accent text-white border-accent' : 'bg-surface text-secondary border-border hover:bg-surface-alt'
              }`}
            >
              {label}
              <span
                className={`font-mono text-[10.5px] rounded-[10px] px-[7px] py-[2px] ${
                  active ? 'bg-white/20 text-white' : 'bg-surface-alt text-muted'
                }`}
              >
                {visible}/{total}
              </span>
            </button>
          )
        })}
      </div>

      {/* Step 2 — page list for the active role */}
      <div className="flex flex-wrap gap-2">
        {pagesForActiveRole.map((page) => {
          const { visible, total } = countFor(KPI_REGISTRY.filter((e) => e.role === activeRole && e.page === page))
          const active = selectedPage === page
          const entry = PAGE_REGISTRY.find((p) => p.role === activeRole && p.page === page)
          const enabled = entry ? (visibility[entry.id] ?? true) : true
          return (
            <button
              key={page}
              onClick={() => setSelectedPage(page)}
              className={`flex items-center gap-[8px] rounded-[9px] border px-[12px] py-[7px] text-[12.5px] font-medium cursor-pointer transition-colors duration-150 ${
                !enabled
                  ? 'bg-surface text-muted border-border opacity-60'
                  : active
                    ? 'bg-accent-light text-accent border-accent'
                    : 'bg-surface text-secondary border-border hover:bg-surface-alt'
              }`}
            >
              {page}
              {!enabled && (
                <span className="rounded-full bg-danger-light px-[6px] py-px text-[9.5px] font-semibold text-danger">
                  Hidden
                </span>
              )}
              <span className="font-mono text-[10.5px] text-muted">{visible}/{total}</span>
            </button>
          )
        })}
      </div>

      {/* Step 3 — toggle rows for the selected page */}
      {selectedPage && (
        <Panel
          title={selectedPage}
          subtitle={pageHref}
          badge={
            pageEntry && (
              <div className="flex shrink-0 items-center gap-[8px]">
                <ToggleSwitch
                  checked={pageEnabled}
                  disabled={savingId === pageEntry.id || !token}
                  label={`Show ${selectedPage} in sidebar`}
                  onChange={(next) => token && setCardVisibility(pageEntry.id, next, token)}
                />
              </div>
            )
          }
          noPadding
        >
          {!pageEnabled && (
            <div className="border-b border-border bg-danger-light px-5 py-[9px] text-[11.5px] text-danger">
              This page is hidden from the sidebar — the cards below won&apos;t be seen by anyone until you turn it back on.
            </div>
          )}
          <div className={`flex flex-col transition-opacity duration-150 ${!pageEnabled ? 'opacity-50' : ''}`}>
            {pageItems.map((entry, i) => {
              const checked = visibility[entry.id] ?? true
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 px-5 py-[10px] ${i !== pageItems.length - 1 ? 'border-b border-border' : ''} ${hover?.id === entry.id ? 'bg-surface-alt' : ''}`}
                >
                  <KpiThumbnail type={entry.type} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-medium truncate">{entry.label}</div>
                    <div className="text-[11px] text-muted truncate">{entry.description}</div>
                  </div>
                  <button
                    type="button"
                    onMouseEnter={(e) => handleRowEnter(entry.id, e.currentTarget)}
                    onMouseLeave={handleRowLeave}
                    onFocus={(e) => handleRowEnter(entry.id, e.currentTarget)}
                    onBlur={handleRowLeave}
                    className={`flex shrink-0 cursor-pointer items-center gap-[5px] rounded-[7px] border px-[10px] py-[6px] text-[11px] font-medium transition-colors duration-150 ${
                      hover?.id === entry.id
                        ? 'border-accent bg-accent-light text-accent'
                        : 'border-border bg-surface text-secondary hover:border-accent hover:text-accent hover:bg-accent-light'
                    }`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Preview
                  </button>
                  <ToggleSwitch
                    checked={checked}
                    disabled={!pageEnabled || savingId === entry.id || !token}
                    label={entry.label}
                    onChange={(next) => token && setCardVisibility(entry.id, next, token)}
                  />
                </div>
              )
            })}
          </div>
        </Panel>
      )}

      {hover && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            [hover.anchor]: hover.offset,
            left: hover.left,
            width: PREVIEW_DISPLAY_WIDTH,
          }}
          className="z-999 pointer-events-none rounded-[12px] border border-border bg-surface p-3 shadow-[0_16px_40px_-8px_rgba(0,0,0,.3)]"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[.08em] text-muted">Live preview</span>
            <span className="rounded-full bg-surface-alt px-2 py-[2px] text-[9.5px] text-secondary">Sample data</span>
          </div>
          <div style={{ height: previewHeight, overflow: 'hidden' }}>
            <div
              ref={previewContentRef}
              style={{ width: PREVIEW_NATURAL_WIDTH, transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left' }}
            >
              {getKpiPreview(hover.id) ?? <p className="text-[12px] text-muted">Preview not available for this item.</p>}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
