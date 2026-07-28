'use client'

import { useState } from 'react'
import styles from './RevenueImpactTable.module.css'
import { REVENUE_IMPACT_DATA } from '@/lib/revenue-impact-data'
import type { RevenueImpactData } from '@/types/revenue-impact'

export default function RevenueImpactTable() {
  const [data] = useState<RevenueImpactData>(REVENUE_IMPACT_DATA)

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
