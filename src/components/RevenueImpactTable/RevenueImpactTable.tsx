'use client'

import { useState } from 'react'
import styles from './RevenueImpactTable.module.css'
import { REVENUE_IMPACT_DATA } from '@/lib/revenue-impact-data'
import type { RevenueImpactData } from '@/types/revenue-impact'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'

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

export default function RevenueImpactTable({ previewMode }: { previewMode?: boolean } = {}) {
  const [realData] = useState<RevenueImpactData>(REVENUE_IMPACT_DATA)
  const data = previewMode ? { ...PREVIEW_DATA, rows: PREVIEW_DATA.rows.slice(0, 2) } : realData
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.roiRevenueImpactTable] ?? true)

  if (!previewMode && !visible) return null

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="flex items-start justify-between border-b border-border px-5 pt-4 pb-3">
        <div>
          <div className="font-semibold text-[13px]">{data.title}</div>
          <div className="text-muted text-[11px] mt-0.5">{data.subtitle}</div>
        </div>
        <div className="font-bold rounded-[20px] whitespace-nowrap bg-surface-alt text-muted text-[10px] px-[8px] py-[3px]">
          {data.badge}
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
            {data.rows.map((row) => (
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

            {/* Cost row */}
            <tr style={{ background: '#FAFAF8' }}>
              <td>
                <div className="font-medium text-[13px] text-amber">{data.costRow.label}</div>
                <div className="text-muted text-[11px]">{data.costRow.sub}</div>
              </td>
              <td>—</td>
              <td className="text-secondary text-[12px]">{data.costRow.outcome}</td>
              <td>
                <span className="font-mono font-bold text-[13px] text-amber">{data.costRow.cost}</span>
                <span className="font-semibold rounded-[4px] bg-amber-light text-amber text-[9.5px] px-[5px] py-px ml-1">Cost</span>
              </td>
              <td>
                <span className="font-mono font-bold text-[13px] text-amber">{data.costRow.cost}</span>
                <span className="font-semibold rounded-[4px] bg-amber-light text-amber text-[9.5px] px-[5px] py-px ml-1">Cost</span>
              </td>
            </tr>

            {/* Net ROI row */}
            <tr style={{ background: 'var(--color-accent-light)' }}>
              <td>
                <div className="text-accent font-medium text-[14px]">{data.netRoiRow.label}</div>
              </td>
              <td>—</td>
              <td className="text-accent font-medium text-[12px]">{data.netRoiRow.outcome}</td>
              <td>
                <span className="font-mono font-bold text-[15px] text-accent">{data.netRoiRow.actual}</span>
              </td>
              <td>
                <span className="font-mono font-bold text-[15px] text-cobalt">{data.netRoiRow.projected}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
