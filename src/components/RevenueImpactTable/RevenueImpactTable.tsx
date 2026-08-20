'use client'

import { useSearchParams } from 'next/navigation'
import styles from './RevenueImpactTable.module.css'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'
import type { RoiAttributionResponse } from '@/types/owner-roi'
import { resolveRoiView } from '@/utils/roi-view'

const METRIC_COLORS: Record<string, string> = {
  team_score: '#1D5C3A',
  checkout_speed: '#C47F18',
  time_to_service: '#1E4D7A',
}

const getMetricColor = (key: string, index: number) => {
  if (METRIC_COLORS[key]) return METRIC_COLORS[key]
  const fallbackColors = ['#1D5C3A', '#C47F18', '#1E4D7A', '#5C3A8C']
  return fallbackColors[index % fallbackColors.length]
}

const formatScore = (val: number | null, key: string) => {
  if (val === null || val === undefined) return 'N/A'
  const formatted = val % 1 === 0 ? val.toString() : val.toFixed(1)
  if (key.includes('speed') || key.includes('time')) return `${formatted}s`
  return formatted
}

const formatDollar = (amount: number | null) => {
  const val = amount ?? 0
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

import { REVENUE_IMPACT_DATA } from '@/lib/revenue-impact-data'
import type { RevenueImpactData } from '@/types/revenue-impact'

const PREVIEW_DATA: RevenueImpactData = {
  ...REVENUE_IMPACT_DATA,
  rows: [
    { metric: 'Team Hospitality Score', sub: 'Greeting rate, tone, engagement', scoreBefore: '71', scoreAfter: '86', scoreColor: '#1D5C3A', barWidth: '86%', barColor: '#1D5C3A', outcome: 'Longer dwell time, higher basket size', actual: '$7,400', projected: '$9,100' },
    { metric: 'Checkout Speed', sub: 'Avg transaction time per customer', scoreBefore: '52s', scoreAfter: '34s', scoreColor: '#C47F18', barWidth: '65%', barColor: '#C47F18', outcome: 'More customers served per shift', actual: '$6,200', projected: '$7,800' },
    { metric: 'Time to Service', sub: 'Greeting delay reduction', scoreBefore: '68', scoreAfter: '82', scoreColor: '#1E4D7A', barWidth: '82%', barColor: '#1E4D7A', outcome: 'Fewer walk-outs during peak hours', actual: '$4,800', projected: '$5,900' },
  ],
  costRow: { label: 'Pythia Platform Cost', sub: 'All-in monthly subscription', outcome: 'Coaching, analytics, hardware', cost: '$1,200' },
  netRoiRow: { label: 'Net ROI', outcome: '14.3x return on platform spend', actual: '$17,200', projected: '$20,600' },
}

export default function RevenueImpactTable({ data, previewMode }: { data?: RoiAttributionResponse['revenue_impact_table']; previewMode?: boolean }) {
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.roiRevenueImpactTable] ?? true)
  const searchParams = useSearchParams()
  const view = resolveRoiView(searchParams.get('view'))

  if (!previewMode && !visible) return null
  if (!previewMode && !data) return null

  // 'both' (the default) shows both columns; 'actual'/'projected' each drop the
  // other column entirely rather than just graying out its values.
  const showActual = view !== 'projected'
  const showProjected = view !== 'actual'

  if (previewMode) {
    return (
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="flex items-start justify-between border-b border-border px-5 pt-4 pb-3">
          <div>
            <div className="font-semibold text-[13px]">{PREVIEW_DATA.title}</div>
            <div className="text-muted text-[11px] mt-0.5">{PREVIEW_DATA.subtitle}</div>
          </div>
          <div className="font-bold rounded-[20px] whitespace-nowrap bg-surface-alt text-muted text-[10px] px-[8px] py-[3px]">
            {PREVIEW_DATA.badge}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Metric Improved</th>
                <th>Score Change</th>
                <th>Business Outcome</th>
                <th>Actual Impact</th>
                <th>Projected (next 4 mo)</th>
              </tr>
            </thead>
            <tbody>
              {PREVIEW_DATA.rows.map((row) => (
                <tr key={row.metric}>
                  <td>
                    <div className="font-medium text-[13px]">{row.metric}</div>
                    <div className="text-muted text-[11px]">{row.sub}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-[6px]">
                      <span className="font-mono text-muted text-[12px]">{row.scoreBefore}</span>
                      <span className="text-muted text-[11px]">→</span>
                      <span className="font-mono font-bold text-[12px]" style={{ color: row.scoreColor }}>{row.scoreAfter}</span>
                    </div>
                    <div className="bg-surface-alt rounded-[3px] overflow-hidden h-[6px] mt-[5px]">
                      <div className="h-full rounded-[3px]" style={{ width: row.barWidth, background: row.barColor }} />
                    </div>
                  </td>
                  <td className="text-secondary text-[12px]">{row.outcome}</td>
                  <td>
                    <span className="font-mono font-bold text-[13px] text-accent">{row.actual}</span>
                    <span className="font-semibold rounded-[4px] bg-accent-light text-accent text-[9.5px] px-[5px] py-px ml-1">Actual</span>
                  </td>
                  <td>
                    <span className="font-mono font-bold text-[13px] text-cobalt">{row.projected}</span>
                    <span className="font-semibold rounded-[4px] bg-cobalt-light text-cobalt text-[9.5px] px-[5px] py-px ml-1">Proj</span>
                  </td>
                </tr>
              ))}
              <tr style={{ background: '#FAFAF8' }}>
                <td>
                  <div className="font-medium text-[13px] text-amber">{PREVIEW_DATA.costRow.label}</div>
                  <div className="text-muted text-[11px]">{PREVIEW_DATA.costRow.sub}</div>
                </td>
                <td>—</td>
                <td className="text-secondary text-[12px]">{PREVIEW_DATA.costRow.outcome}</td>
                <td>
                  <span className="font-mono font-bold text-[13px] text-amber">{PREVIEW_DATA.costRow.cost}</span>
                  <span className="font-semibold rounded-[4px] bg-amber-light text-amber text-[9.5px] px-[5px] py-px ml-1">Cost</span>
                </td>
                <td>
                  <span className="font-mono font-bold text-[13px] text-amber">{PREVIEW_DATA.costRow.cost}</span>
                  <span className="font-semibold rounded-[4px] bg-amber-light text-amber text-[9.5px] px-[5px] py-px ml-1">Cost</span>
                </td>
              </tr>
              <tr style={{ background: 'var(--color-accent-light)' }}>
                <td>
                  <div className="text-accent font-medium text-[14px]">{PREVIEW_DATA.netRoiRow.label}</div>
                </td>
                <td>—</td>
                <td className="text-accent font-medium text-[12px]">{PREVIEW_DATA.netRoiRow.outcome}</td>
                <td>
                  <span className="font-mono font-bold text-[15px] text-accent">{PREVIEW_DATA.netRoiRow.actual}</span>
                </td>
                <td>
                  <span className="font-mono font-bold text-[15px] text-cobalt">{PREVIEW_DATA.netRoiRow.projected}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="flex items-start justify-between border-b border-border px-5 pt-4 pb-3">
        <div>
          <div className="font-semibold text-[13px]">Revenue Impact by Metric</div>
          <div className="text-muted text-[11px] mt-0.5">Estimated financial attribution</div>
        </div>
        <div className="font-bold rounded-[20px] whitespace-nowrap bg-surface-alt text-muted text-[10px] px-[8px] py-[3px]">
          Based on standard formulas
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Metric Improved</th>
              <th>Score Change</th>
              <th>Business Outcome</th>
              {showActual && <th>Actual Impact</th>}
              {showProjected && <th>Projected (next 4 mo)</th>}
            </tr>
          </thead>
          <tbody>
            {data!.rows.map((row, i) => {
              const color = getMetricColor(row.metric_key, i)
              return (
                <tr key={row.metric_key}>
                  <td>
                    <div className="font-medium text-[13px]">{row.metric_label}</div>
                    <div className="text-muted text-[11px]">{row.metric_sublabel}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-[6px]">
                      <span className="font-mono text-muted text-[12px]">{formatScore(row.score_before, row.metric_key)}</span>
                      <span className="text-muted text-[11px]">→</span>
                      <span className="font-mono font-bold text-[12px]" style={{ color }}>{formatScore(row.score_after, row.metric_key)}</span>
                    </div>
                    <div className="bg-surface-alt rounded-[3px] overflow-hidden h-[6px] mt-[5px]">
                      <div className="h-full rounded-[3px]" style={{ width: `${Math.min(100, Math.max(0, row.score_after ?? 0))}%`, background: color }} />
                    </div>
                  </td>
                  <td className="text-secondary text-[12px]">{row.business_outcome}</td>
                  {showActual && (
                    <td>
                      <span className="font-mono font-bold text-[13px] text-accent">{formatDollar(row.actual_impact)}</span>
                      <span className="font-semibold rounded-[4px] bg-accent-light text-accent text-[9.5px] px-[5px] py-px ml-1">Actual</span>
                    </td>
                  )}
                  {showProjected && (
                    <td>
                      <span className="font-mono font-bold text-[13px] text-cobalt">{formatDollar(row.projected_impact)}</span>
                      <span className="font-semibold rounded-[4px] bg-cobalt-light text-cobalt text-[9.5px] px-[5px] py-px ml-1">Proj</span>
                    </td>
                  )}
                </tr>
              )
            })}

            {/* Cost row */}
            <tr style={{ background: '#FAFAF8' }}>
              <td>
                <div className="font-medium text-[13px] text-amber">{data!.platform_cost_row.label}</div>
                <div className="text-muted text-[11px]">{data!.platform_cost_row.sublabel}</div>
              </td>
              <td>—</td>
              <td className="text-secondary text-[12px]">Software subscription</td>
              {showActual && (
                <td>
                  <span className="font-mono font-bold text-[13px] text-amber">{formatDollar(data!.platform_cost_row.actual_cost)}</span>
                  <span className="font-semibold rounded-[4px] bg-amber-light text-amber text-[9.5px] px-[5px] py-px ml-1">Cost</span>
                </td>
              )}
              {showProjected && (
                <td>
                  <span className="font-mono font-bold text-[13px] text-amber">{formatDollar(data!.platform_cost_row.projected_cost)}</span>
                  <span className="font-semibold rounded-[4px] bg-amber-light text-amber text-[9.5px] px-[5px] py-px ml-1">Cost</span>
                </td>
              )}
            </tr>

            {/* Net ROI row */}
            <tr style={{ background: 'var(--color-accent-light)' }}>
              <td>
                <div className="text-accent font-medium text-[14px]">{data!.net_roi_row.label}</div>
              </td>
              <td>—</td>
              <td className="text-accent font-medium text-[12px]">{data!.net_roi_row.note}</td>
              {showActual && (
                <td>
                  <span className="font-mono font-bold text-[15px] text-accent">{formatDollar(data!.net_roi_row.actual_amount)}</span>
                </td>
              )}
              {showProjected && (
                <td>
                  <span className="font-mono font-bold text-[15px] text-cobalt">{formatDollar(data!.net_roi_row.projected_amount)}</span>
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
