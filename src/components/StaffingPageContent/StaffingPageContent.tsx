'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/context/ToastContext'
import { useStaffingStore } from '@/store/staffingStore'
import {
  transformScheduleToStaffEmployees,
  transformRosterToTeamScores,
  transformHeatmapToRows,
  transformHeatmapToPeakBars,
  transformHeatmapToDayLabels,
  addDaysToDateString,
} from '@/lib/staffing-transform'
import StaffingSchedulePanel from '@/components/StaffingSchedulePanel/StaffingSchedulePanel'
import StaffingRecommendations from '@/components/StaffingRecommendations/StaffingRecommendations'
import StaffingTeamScores from '@/components/StaffingTeamScores/StaffingTeamScores'
import type {
  ApiScheduleResponse,
  ApiRosterMember,
  ApiTrafficHeatmap,
  ApiInsights,
  ApiRecommendationsResponse,
} from '@/types/staff'

type EditTarget = { empIdx: number; dayIdx: number } | null

const DAY_PART_OPTIONS = [
  { value: 'off', label: 'Day Off' },
  { value: 'morning', label: 'Morning (7a – 11a)' },
  { value: 'afternoon', label: 'Afternoon (11a – 5p)' },
  { value: 'evening', label: 'Evening (5p – 9p)' },
  { value: 'night', label: 'Night (9p – 7a)' },
]

interface Props {
  storeId: string
  initialWeekStartDate: string
  initialSchedule: ApiScheduleResponse | null
  initialRoster: ApiRosterMember[]
  initialHeatmap: ApiTrafficHeatmap | null
  initialInsights: ApiInsights | null
  initialRecommendations: ApiRecommendationsResponse | null
}

export default function StaffingPageContent({
  storeId,
  initialWeekStartDate,
  initialSchedule,
  initialRoster,
  initialHeatmap,
  initialInsights,
  initialRecommendations,
}: Props) {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token
  const { showToast } = useToast()

  const hydrate = useStaffingStore((s) => s.hydrate)
  const schedule = useStaffingStore((s) => s.schedule)
  const roster = useStaffingStore((s) => s.roster)
  const heatmap = useStaffingStore((s) => s.heatmap)
  const recommendations = useStaffingStore((s) => s.recommendations)
  const criticalAlert = useStaffingStore((s) => s.criticalAlert)
  const generationStatus = useStaffingStore((s) => s.generationStatus)
  const weekStartDate = useStaffingStore((s) => s.weekStartDate)
  const applyingId = useStaffingStore((s) => s.applyingId)
  const savingShift = useStaffingStore((s) => s.savingShift)
  const lastSyncedAt = useStaffingStore((s) => s.lastSyncedAt)
  const saveShiftAction = useStaffingStore((s) => s.saveShift)
  const deleteShiftAction = useStaffingStore((s) => s.deleteShift)
  const fetchAll = useStaffingStore((s) => s.fetchAll)
  const applyRecommendation = useStaffingStore((s) => s.applyRecommendation)
  const applyAllRecommendations = useStaffingStore((s) => s.applyAllRecommendations)
  const dismissRecommendation = useStaffingStore((s) => s.dismissRecommendation)

  useEffect(() => {
    hydrate({
      storeId,
      weekStartDate: initialWeekStartDate,
      schedule: initialSchedule,
      roster: initialRoster,
      heatmap: initialHeatmap,
      insights: initialInsights,
      recommendations: initialRecommendations,
    })
    // Seed once from server-fetched props — subsequent updates flow through the
    // store's own actions (fetchAll/goToNextWeek/etc), same pattern as
    // Sidebar seeding userStore.points from the session on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [editTarget, setEditTarget] = useState<EditTarget>(null)
  const [editDayPart, setEditDayPart] = useState('off')
  const [editPaired, setEditPaired] = useState('Solo')

  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editTarget !== null && drawerRef.current) {
      drawerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [editTarget])

  const effectiveWeekStartDate = weekStartDate ?? initialWeekStartDate
  const employees =
    schedule && roster.length > 0 ? transformScheduleToStaffEmployees(schedule, roster, effectiveWeekStartDate) : []
  const teamScores = transformRosterToTeamScores(roster)
  const heatmapRows = heatmap ? transformHeatmapToRows(heatmap) : []
  const peakBars = heatmap ? transformHeatmapToPeakBars(heatmap) : []
  const dayLabels = heatmap ? transformHeatmapToDayLabels(heatmap) : []
  const pairedWithOptions = ['Solo', ...roster.map((r) => `${r.first_name} ${r.last_name}`.trim())]

  const findExistingShift = (empIdx: number, dayIdx: number) => {
    if (!schedule) return null
    const employee = roster[empIdx]
    if (!employee) return null
    const dateStr = addDaysToDateString(effectiveWeekStartDate, dayIdx)
    const dayShifts = (schedule.by_employee[employee.employee_id] ?? []).filter((s) => s.date === dateStr)
    return dayShifts[0] ?? null
  }

  const nameForEmployeeId = (employeeId: string | null | undefined) => {
    const r = roster.find((m) => m.employee_id === employeeId)
    return r ? `${r.first_name} ${r.last_name}`.trim() : 'Solo'
  }

  const handleShiftClick = (empIdx: number, dayIdx: number) => {
    // toggle off if same shift clicked again
    if (editTarget?.empIdx === empIdx && editTarget?.dayIdx === dayIdx) {
      setEditTarget(null)
      return
    }
    setEditTarget({ empIdx, dayIdx })
    const existing = findExistingShift(empIdx, dayIdx)
    setEditDayPart(existing?.day_part ?? 'off')
    setEditPaired(existing?.paired_with ? nameForEmployeeId(existing.paired_with) : 'Solo')
  }

  const closeEdit = () => setEditTarget(null)

  const saveShift = async () => {
    if (!editTarget || !token) return
    const { empIdx, dayIdx } = editTarget
    const employee = roster[empIdx]
    if (!employee) return

    const dateStr = addDaysToDateString(effectiveWeekStartDate, dayIdx)
    const existing = findExistingShift(empIdx, dayIdx)
    const isRealShiftId = !!existing && !existing.id.startsWith('actual:')
    const pairedEmployee = editPaired === 'Solo' ? null : roster.find((r) => `${r.first_name} ${r.last_name}`.trim() === editPaired)

    if (editDayPart === 'off') {
      if (isRealShiftId && existing) {
        await deleteShiftAction(token, existing.id)
        showToast('Shift removed')
      }
      closeEdit()
      return
    }

    if (isRealShiftId && existing) {
      await saveShiftAction(token, {
        shiftId: existing.id,
        body: { day_part: editDayPart, paired_with: pairedEmployee?.employee_id ?? null },
      })
    } else {
      await saveShiftAction(token, {
        shiftId: null,
        body: {
          store_id: storeId,
          employee_id: employee.employee_id,
          date: dateStr,
          day_part: editDayPart,
          paired_with: pairedEmployee?.employee_id ?? null,
        },
      })
    }
    showToast('Shift updated')
    closeEdit()
  }

  const drawerTitle =
    editTarget != null && employees[editTarget.empIdx]
      ? `${employees[editTarget.empIdx].name} · ${(dayLabels[editTarget.dayIdx] ?? '').replace(' ●', '').replace(' ⚠', '')}`
      : ''

  return (
    <>
      {/* Two-column layout: schedule left, right panel fixed 320px */}
      <div className="grid gap-[18px] items-start" style={{ gridTemplateColumns: '1fr 320px' }}>
        {/* Left: schedule */}
        <div className="flex flex-col gap-[14px]">
          {criticalAlert && (
            <div className="bg-danger-light border border-[#EAB8B3] rounded-[11px] px-4 py-3 flex items-start gap-[10px]">
              <span className="text-[15px] shrink-0 mt-px">🚨</span>
              <div className="text-[12.5px] text-danger leading-[1.5] flex-1">
                <strong className="font-semibold">{criticalAlert.text}</strong> {criticalAlert.detail}
              </div>
            </div>
          )}

          <StaffingSchedulePanel
            employees={employees}
            selectedShift={editTarget}
            onShiftClick={handleShiftClick}
            heatmapRows={heatmapRows}
            peakBars={peakBars}
            dayLabels={dayLabels}
            onApplyAllSuggestions={async () => {
              if (!token) return
              const ok = await applyAllRecommendations(token)
              showToast(ok ? 'All suggestions applied to schedule' : 'Some suggestions failed to apply — try again')
            }}
            onDiscardChanges={() => token && fetchAll(token)}
            onSaveDraft={() => token && fetchAll(token)}
            isSaving={savingShift}
            lastSyncedAt={lastSyncedAt}
          />
        </div>

        {/* Right: recommendations + edit drawer (when open) + team scores */}
        <div className="flex flex-col gap-[14px]">
          <StaffingRecommendations
            recommendations={recommendations}
            generationStatus={generationStatus}
            applyingId={applyingId}
            onApply={async (id) => {
              if (!token) return
              const ok = await applyRecommendation(token, id)
              showToast(ok ? 'Recommendation applied to schedule' : 'Failed to apply recommendation — please try again')
            }}
            onDismiss={async (id) => {
              if (!token) return
              const ok = await dismissRecommendation(token, id)
              showToast(ok ? 'Recommendation dismissed' : 'Failed to dismiss recommendation — please try again')
            }}
          />

          {/* Edit Drawer — appears between Recommendations and Team Scores when a shift is selected */}
          {editTarget !== null && (
            <div ref={drawerRef} className="bg-surface border-2 border-accent rounded-[14px] overflow-hidden flex flex-col mt-2 scroll-mt-[200px]">
              <div className="flex items-center justify-between px-4 py-[13px] bg-accent">
                <span className="text-[12.5px] font-semibold text-white">{drawerTitle}</span>
                <button
                  onClick={closeEdit}
                  className="bg-transparent border-0 text-white/70 text-[18px] cursor-pointer leading-none hover:text-white font-sans"
                >
                  ×
                </button>
              </div>
              <div className="px-4 py-[14px] flex flex-col gap-3">
                <div className="flex flex-col gap-[5px]">
                  <div className="text-[10.5px] font-semibold text-muted uppercase tracking-[.08em]">Shift Hours</div>
                  <select
                    className="w-full px-[10px] py-2 border border-border rounded-lg font-sans text-[13px] text-primary bg-surface cursor-pointer focus:outline-none focus:border-accent"
                    value={editDayPart}
                    onChange={(e) => setEditDayPart(e.target.value)}
                  >
                    {DAY_PART_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-[5px]">
                  <div className="text-[10.5px] font-semibold text-muted uppercase tracking-[.08em]">Paired With</div>
                  <select
                    className="w-full px-[10px] py-2 border border-border rounded-lg font-sans text-[13px] text-primary bg-surface cursor-pointer focus:outline-none focus:border-accent"
                    value={editPaired}
                    onChange={(e) => setEditPaired(e.target.value)}
                  >
                    {pairedWithOptions.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-border flex gap-2">
                <button
                  onClick={saveShift}
                  className="flex-1 py-[9px] bg-accent text-white border-0 rounded-lg font-sans text-[13px] font-semibold cursor-pointer hover:opacity-85 transition-opacity"
                >
                  Save Shift
                </button>
                <button
                  onClick={closeEdit}
                  className="px-[14px] py-[9px] bg-transparent text-muted border border-border rounded-lg font-sans text-[13px] cursor-pointer hover:bg-surface-alt transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <StaffingTeamScores members={teamScores} />
        </div>
      </div>
    </>
  )
}
