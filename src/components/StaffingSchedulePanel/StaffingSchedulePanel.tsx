'use client'

import { Fragment } from 'react'
import {
  type Shift,
  type ShiftVariant,
  type StaffEmployee,
} from '@/types/staff'
import { formatRelativeTime } from '@/utils/common'

const shiftBlockClass: Record<ShiftVariant, string> = {
  high: 'bg-accent-light border border-[#B8D9C6]',
  mid: 'bg-amber-light border border-[#E8C49A]',
  low: 'bg-danger-light border border-[#EAB8B3]',
  off: 'bg-surface-alt border border-border',
  gap: 'border border-dashed border-[#EAB8B3]',
  fatigue: 'border border-[#E8C49A]',
  suggested: 'border-[1.5px] border-dashed border-accent',
}

const shiftTimeColor: Record<ShiftVariant, string> = {
  high: 'text-accent',
  mid: 'text-amber',
  low: 'text-danger',
  off: 'text-muted',
  gap: 'text-danger',
  fatigue: 'text-amber',
  suggested: 'text-accent',
}

const flagTextColor: Record<string, string> = {
  gap: 'text-danger',
  fatigue: 'text-amber',
  suggested: 'text-accent',
}

const scoreColorClass: Record<string, string> = {
  good: 'text-accent',
  ok: 'text-amber',
  bad: 'text-danger',
}

interface Props {
  employees: StaffEmployee[]
  selectedShift: { empIdx: number; dayIdx: number } | null
  onShiftClick: (empIdx: number, dayIdx: number) => void
  heatmapRows: { label: string; cells: string[] }[]
  peakBars: { label: string; width: string; color: string }[]
  dayLabels: string[]
  onApplyAllSuggestions: () => void
  onDiscardChanges: () => void
  onSaveDraft: () => void
  isSaving: boolean
  lastSyncedAt: string | null
}

export default function StaffingSchedulePanel({
  employees,
  selectedShift,
  onShiftClick,
  heatmapRows,
  peakBars,
  dayLabels,
  onApplyAllSuggestions,
  onDiscardChanges,
  onSaveDraft,
  isSaving,
  lastSyncedAt,
}: Props) {
  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-[15px] border-b border-border">
        <div>
          <div className="text-[13.5px] font-semibold">Weekly Schedule</div>
          <div className="text-[11.5px] text-muted mt-0.5">Click any shift to edit · Pythia flags are shown inline</div>
        </div>
        <button
          onClick={onApplyAllSuggestions}
          className="text-[11.5px] font-medium text-secondary border border-border bg-none rounded-lg px-3 py-[6px] cursor-pointer bg-surface hover:bg-surface-alt transition-colors"
        >
          Apply All Suggestions
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-[14px] px-5 py-[10px] border-b border-border bg-surface-alt mt-[14px]">
        {[
          { bg: 'bg-accent-light border border-[#B8D9C6]', label: 'High performer' },
          { bg: 'bg-amber-light border border-[#E8C49A]', label: 'Mid performer' },
          { bg: 'bg-danger-light border border-[#EAB8B3]', label: 'Needs support' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-[5px] text-[11px] text-secondary">
            <div className={`w-[9px] h-[9px] rounded-[2px] shrink-0 ${l.bg}`} />
            {l.label}
          </div>
        ))}
        <div className="flex items-center gap-[5px] text-[11px] text-secondary">
          <div className="w-[9px] h-[9px] rounded-[2px] shrink-0 border border-dashed border-[#EAB8B3]" style={{ background: 'repeating-linear-gradient(45deg,#FDF8F7,#FDF8F7 3px,#FCECEA 3px,#FCECEA 6px)' }} />
          Coverage gap
        </div>
        <div className="flex items-center gap-[5px] text-[11px] text-secondary">
          <div className="w-[9px] h-[9px] rounded-[2px] shrink-0 border border-[#E8C49A]" style={{ background: 'linear-gradient(135deg,#FDF5E4,#FEF0D0)' }} />
          Fatigue risk
        </div>
        <div className="flex items-center gap-[5px] text-[11px] text-secondary">
          <div className="w-[9px] h-[9px] rounded-[2px] shrink-0 border border-dashed border-accent" style={{ background: 'linear-gradient(135deg,#E6F2EC,#D0EAD8)' }} />
          Suggested shift
        </div>
      </div>

      {/* Heatmap */}
      <div className="px-5 pt-3 pb-2 border-b border-border">
        <div className="text-[9.5px] font-semibold text-muted uppercase tracking-[.09em] mb-2">Customer traffic by hour · Node 2 data</div>
        <div className="grid gap-[3px]" style={{ gridTemplateColumns: '80px repeat(7,1fr)' }}>
          <div />
          {dayLabels.map((d, i) => (
            <div
              key={i}
              className={`text-[9.5px] font-semibold text-center pb-1 ${d.includes('⚠') ? 'text-danger' : d.includes('●') ? 'text-accent font-bold' : 'text-muted'}`}
            >
              {d.split(' ').slice(0, 2).join(' ')}
            </div>
          ))}
          {heatmapRows.map((row) => (
            <Fragment key={row.label}>
              <div className="text-[9.5px] text-muted font-mono flex items-center">{row.label}</div>
              {row.cells.map((color, ci) => (
                <div key={ci} className="h-[18px] rounded-[3px]" style={{ background: color }} />
              ))}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Week Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 580 }}>
          <thead>
            <tr>
              <th className="text-[10px] font-semibold text-muted uppercase tracking-[.08em] px-2 pt-[10px] pb-2 border-b border-border text-center whitespace-nowrap pl-5 w-[130px]">
                Employee
              </th>
              {dayLabels.map((d, i) => (
                <th
                  key={d + i}
                  className={`text-[10px] font-semibold uppercase tracking-[.08em] px-2 pt-[10px] pb-2 border-b border-border text-center whitespace-nowrap last:pr-5 ${d.includes('●')
                    ? 'bg-accent-light text-accent'
                    : d.includes('⚠')
                      ? 'bg-surface-alt text-danger'
                      : 'bg-surface-alt text-muted'
                    }`}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, empIdx) => (
              <tr key={emp.id}>
                <td className="px-2 py-[6px] border-b border-border align-top pl-5">
                  <div className="flex items-center gap-2 py-[6px]">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[9.5px] font-bold text-white shrink-0"
                      style={{ background: emp.avatarColor }}
                    >
                      {emp.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-medium truncate" title={emp.name}>{emp.name}</div>
                      <div className={`text-[10px] font-mono font-semibold ${scoreColorClass[emp.scoreColor]}`}>{emp.score}</div>
                    </div>
                  </div>
                </td>
                {emp.shifts.map((shift: Shift, dayIdx) => {
                  const isSelected = selectedShift?.empIdx === empIdx && selectedShift?.dayIdx === dayIdx
                  return (
                    <td key={dayIdx} className="px-[6px] py-[6px] border-b border-border align-top last:pr-5">
                      <div
                        onClick={() => onShiftClick(empIdx, dayIdx)}
                        className={`rounded-[8px] px-[9px] py-[6px] my-px cursor-pointer hover:opacity-85 transition-all ${shiftBlockClass[shift.variant]} ${isSelected ? 'ring-2 ring-primary shadow-md' : ''
                          }`}
                        style={
                          shift.variant === 'gap'
                            ? { background: 'repeating-linear-gradient(45deg,#FDF8F7,#FDF8F7 4px,#FCECEA 4px,#FCECEA 8px)' }
                            : shift.variant === 'fatigue'
                              ? { background: 'linear-gradient(135deg,var(--color-amber-light),#FEF0D0)' }
                              : shift.variant === 'suggested'
                                ? { background: 'linear-gradient(135deg,#E6F2EC,#D0EAD8)' }
                                : {}
                        }
                      >
                        <div className={`font-mono text-[9.5px] font-medium leading-[1.2] ${shiftTimeColor[shift.variant]}`}>
                          {shift.time}
                        </div>
                        {shift.flag && (
                          <div className={`text-[9px] font-semibold mt-[2px] ${flagTextColor[shift.flagVariant ?? 'gap']}`}>
                            {shift.flag}
                          </div>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-[12px] text-muted py-8">
                  No employees on record for this store
                </td>
              </tr>
            )}

            {/* Peak row */}
            <tr>
              <td className="bg-surface-alt px-2 pt-[6px] pb-[6px] pl-5">
                <div className="text-[9.5px] font-semibold text-muted uppercase tracking-[.07em] py-[6px]">Peak Traffic</div>
              </td>
              {peakBars.map((bar, i) => (
                <td key={i} className="bg-surface-alt px-[6px] py-1 last:pr-5">
                  <div className="py-1">
                    <div className="h-[28px] bg-border rounded overflow-hidden relative">
                      <div
                        className="h-full rounded flex items-center pl-[6px]"
                        style={{ width: bar.width, background: bar.color }}
                      >
                        <span className="font-mono text-[9.5px] font-semibold text-white whitespace-nowrap">{bar.label}</span>
                      </div>
                    </div>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface-alt">
        <div className="text-[11.5px] text-muted">
          {lastSyncedAt ? (
            <>
              Synced <strong className="text-secondary font-medium">{formatRelativeTime(lastSyncedAt)}</strong>
            </>
          ) : (
            'Not yet synced'
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDiscardChanges}
            className="text-[12.5px] font-medium text-secondary border border-border bg-surface rounded-lg px-[15px] py-[7px] cursor-pointer hover:bg-surface-alt transition-colors font-sans"
          >
            Discard Changes
          </button>
          <button
            onClick={onSaveDraft}
            disabled={isSaving}
            className="text-[12.5px] font-medium text-white bg-primary border-0 rounded-lg px-[15px] py-[7px] cursor-pointer hover:opacity-90 transition-opacity font-sans disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving…' : 'Save Draft'}
          </button>
        </div>
      </div>
    </div>
  )
}
