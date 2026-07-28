'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import CoachingEmpDrilldown from '@/components/CoachingEmpDrilldown/CoachingEmpDrilldown'
import StalledPlansModal from '@/components/StalledPlansModal/StalledPlansModal'
import { useStalledCoachingPlans } from '@/hooks/useStalledCoachingPlans'
import { fetchEmployeeCoachingDetail } from '@/queries/manager-coaching'
import { formatNameList } from '@/utils/common'
import type { CoachingEmployeeChip, CoachingEmployeeDetail } from '@/types/coaching-plan'

interface Props {
  initialEmployees: CoachingEmployeeChip[]
}

const healthDotClass: Record<CoachingEmployeeChip['health'], string> = {
  green: 'bg-accent',
  amber: 'bg-amber',
  red: 'bg-danger',
}

function DrilldownSkeleton() {
  return (
    <div className="p-[22px] flex flex-col gap-4 animate-pulse">
      <div className="h-6 w-48 rounded bg-border" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-border" />
        ))}
      </div>
      <div className="h-48 w-full rounded-xl bg-border" />
    </div>
  )
}

export default function CoachingTrackerPanel({ initialEmployees }: Props) {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token

  const [activeId, setActiveId] = useState(initialEmployees[0]?.user_id ?? null)
  const activeEmployee = initialEmployees.find((e) => e.user_id === activeId) ?? null

  const [detail, setDetail] = useState<CoachingEmployeeDetail | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(true)
  const [isDetailError, setIsDetailError] = useState(false)
  const [detailRetryToken, setDetailRetryToken] = useState(0)

  const [isStalledPlansOpen, setIsStalledPlansOpen] = useState(false)

  // A single shared instance — passed down to the modal/panel too, so
  // resolving or editing a plan inside the popup updates this same state and
  // the banner behind it reflects it immediately, instead of each reading
  // its own independent fetch that only agrees again after a refetch.
  const stalledPlans = useStalledCoachingPlans()
  const { isLoading: isLoadingStalled, groups: stalledGroups, openCount: stalledIssueCount } = stalledPlans
  const stalledNames = stalledGroups.map((g) => g.name)
  const showStalledAlert = !isLoadingStalled && stalledIssueCount > 0

  useEffect(() => {
    if (!token || !activeId) return
    let cancelled = false
    setIsLoadingDetail(true)
    setIsDetailError(false)
    fetchEmployeeCoachingDetail({ token, userId: activeId })
      .then((result) => {
        if (!cancelled) setDetail(result)
      })
      .catch(() => {
        if (!cancelled) setIsDetailError(true)
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDetail(false)
      })
    return () => {
      cancelled = true
    }
  }, [token, activeId, detailRetryToken])

  const totalIssues = initialEmployees.reduce((sum, e) => sum + e.total_issues, 0)

  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden flex flex-col">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-[22px] py-4 border-b border-border">
        <div>
          <div className="text-[14px] font-semibold">Issue → Coaching → Outcome</div>
          <div className="text-[11.5px] text-muted mt-0.5">Click an employee to see their full coaching history</div>
        </div>
        <span className="font-mono text-[11px] text-muted">
          {initialEmployees.length} employee{initialEmployees.length === 1 ? '' : 's'} · {totalIssues} total issue
          {totalIssues === 1 ? '' : 's'}
        </span>
      </div>

      {/* Stalled Alert — hidden entirely when there are no stalled issues */}
      {showStalledAlert && (
        <div className="mx-[22px] mt-[14px] bg-danger-light border border-[#EAB8B3] rounded-[10px] px-[14px] py-[11px] flex items-center gap-[10px]">
          <span className="text-[16px] shrink-0">🚨</span>
          <div className="text-[12.5px] text-danger leading-[1.45] flex-1">
            <strong className="font-semibold">
              {stalledIssueCount} coaching issue{stalledIssueCount === 1 ? '' : 's'} {stalledIssueCount === 1 ? 'has' : 'have'} stalled
              (3+ weeks, no improvement).
            </strong>{' '}
            {stalledNames.length === 1 ? (
              <>{stalledNames[0]} has at least one issue the AI cannot move.</>
            ) : (
              <>{formatNameList(stalledNames)} each have at least one issue the AI cannot move.</>
            )}{' '}
            Manager action required.
          </div>
          <button
            type="button"
            onClick={() => setIsStalledPlansOpen(true)}
            className="text-[11.5px] font-semibold text-danger underline whitespace-nowrap hover:opacity-80 cursor-pointer"
          >
            View all →
          </button>
        </div>
      )}

      {/* Employee Selector */}
      {initialEmployees.length === 0 ? (
        <div className="px-[22px] py-[18px] text-[12.5px] text-muted">No employees found for your store(s).</div>
      ) : (
        <>
          <div className="flex gap-2 px-[22px] py-[14px] border-b border-border overflow-x-auto">
            {initialEmployees.map((emp) => (
              <button
                key={emp.user_id}
                onClick={() => setActiveId(emp.user_id)}
                className={`flex items-center gap-2 px-[14px] py-[7px] rounded-[30px] border cursor-pointer transition-all duration-150 whitespace-nowrap select-none font-sans ${
                  activeId === emp.user_id ? 'bg-primary border-primary' : 'bg-surface border-border hover:border-accent'
                }`}
              >
                <span className={`text-[12.5px] font-medium ${activeId === emp.user_id ? 'text-white' : 'text-secondary'}`}>
                  {emp.name}
                </span>
                <div className={`w-2 h-2 rounded-full shrink-0 ${healthDotClass[emp.health]}`} />
              </button>
            ))}
          </div>

          {/* Active Employee Drilldown */}
          {isLoadingDetail && <DrilldownSkeleton />}
          {!isLoadingDetail && isDetailError && (
            <div className="flex flex-col items-center justify-center gap-2 py-14">
              <p className="text-[12.5px] font-semibold">Failed to load coaching history</p>
              <button
                className="rounded-[8px] border-0 bg-accent px-4 py-2 text-[12px] font-semibold text-white hover:opacity-85 cursor-pointer"
                onClick={() => setDetailRetryToken((n) => n + 1)}
              >
                Retry
              </button>
            </div>
          )}
          {!isLoadingDetail && !isDetailError && detail && activeEmployee && (
            <CoachingEmpDrilldown employee={activeEmployee} detail={detail} />
          )}
        </>
      )}

      {isStalledPlansOpen && (
        <StalledPlansModal data={stalledPlans} onClose={() => setIsStalledPlansOpen(false)} />
      )}
    </div>
  )
}
