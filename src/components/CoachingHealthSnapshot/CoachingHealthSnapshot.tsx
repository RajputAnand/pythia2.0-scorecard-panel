'use client'

import Link from 'next/link'
import Panel from '@/components/shared/Panel/Panel'
import type { CoachingSummary } from '@/types/coaching-plan'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'

interface Props {
  summary: CoachingSummary | null
  previewMode?: boolean
}

function Skeleton() {
  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden animate-pulse">
      <div className="flex items-center justify-between px-5 py-[15px] border-b border-border">
        <div className="h-4 w-32 rounded bg-border" />
        <div className="h-3 w-28 rounded bg-border" />
      </div>
      <div className="grid grid-cols-3 gap-4 px-5 py-[18px]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-6 w-12 rounded bg-border" />
            <div className="h-3 w-24 rounded bg-border" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CoachingHealthSnapshot({ summary, previewMode }: Props) {
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.managerCoachingHealth] ?? true)
  if (!previewMode && !visible) return null
  if (!summary) return <Skeleton />

  const { team_win_rate, ai_stalled, in_progress } = summary

  return (
    <Panel
      title="Coaching Health"
      subtitle={summary.view === 'week' ? 'Current week' : 'All time'}
      badge={
        <Link href="/manager/coaching-tracker" className="text-[11px] font-semibold text-accent hover:underline shrink-0">
          View Coach Tracker →
        </Link>
      }
    >
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-[22px] font-semibold text-accent leading-none">{team_win_rate.pct}%</div>
          <div className="text-[11px] text-muted mt-[6px]">
            Win rate · {team_win_rate.resolved} of {team_win_rate.total} resolved
          </div>
        </div>
        <div>
          <div className="text-[22px] font-semibold text-amber leading-none">{in_progress.count}</div>
          <div className="text-[11px] text-muted mt-[6px]">
            In progress · {in_progress.employees_affected} employee{in_progress.employees_affected === 1 ? '' : 's'}
          </div>
        </div>
        <div>
          <div className={`text-[22px] font-semibold leading-none ${ai_stalled.count > 0 ? 'text-danger' : 'text-accent'}`}>
            {ai_stalled.count}
          </div>
          <div className="text-[11px] text-muted mt-[6px]">
            {ai_stalled.count > 0 ? 'Stalled · needs manager intervention' : 'No stalled issues'}
          </div>
        </div>
      </div>
    </Panel>
  )
}
