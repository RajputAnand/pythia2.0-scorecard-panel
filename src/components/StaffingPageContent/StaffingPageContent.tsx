'use client'

import { useState, useRef, useEffect } from 'react'
import { useToast } from '@/context/ToastContext'
import {
  type Shift,
  type ShiftVariant,
  type StaffEmployee,
} from '@/types/staff'
import {
  STAFF_EMPLOYEES,
  SHIFT_HOURS_OPTIONS,
  STATION_OPTIONS,
  PAIRED_WITH_OPTIONS,
} from "@/lib/staffing-data"
import StaffingSchedulePanel from '@/components/StaffingSchedulePanel/StaffingSchedulePanel'
import StaffingRecommendations from '@/components/StaffingRecommendations/StaffingRecommendations'
import StaffingTeamScores from '@/components/StaffingTeamScores/StaffingTeamScores'

type EditTarget = { empIdx: number; dayIdx: number } | null

const DAYS_DISPLAY = ['Mon 2/23', 'Tue 2/24', 'Wed 2/25 ●', 'Thu 2/26', 'Fri 2/27 ⚠', 'Sat 2/28', 'Sun 3/1']

export default function StaffingPageContent() {
  const { showToast } = useToast()
  const [employees, setEmployees] = useState<StaffEmployee[]>(STAFF_EMPLOYEES)
  const [editTarget, setEditTarget] = useState<EditTarget>(null)
  const [editHours, setEditHours] = useState('')
  const [editStation, setEditStation] = useState('Register 1')
  const [editPaired, setEditPaired] = useState('Solo')
  const [alertDismissed, setAlertDismissed] = useState(false)

  const drawerRef = useRef<HTMLDivElement>(null)

  // Scroll drawer into view whenever it opens
  useEffect(() => {
    if (editTarget !== null && drawerRef.current) {
      drawerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [editTarget])

  const handleShiftClick = (empIdx: number, dayIdx: number) => {
    // toggle off if same shift clicked again
    if (editTarget?.empIdx === empIdx && editTarget?.dayIdx === dayIdx) {
      setEditTarget(null)
      return
    }
    setEditTarget({ empIdx, dayIdx })
    setEditHours(employees[empIdx].shifts[dayIdx].time)
    setEditStation('Register 1')
    setEditPaired('Solo')
  }

  const closeEdit = () => setEditTarget(null)

  const saveShift = () => {
    if (!editTarget) return
    const { empIdx, dayIdx } = editTarget
    setEmployees((prev) =>
      prev.map((e, ei) => {
        if (ei !== empIdx) return e
        const shifts = e.shifts.map((s, si) => {
          if (si !== dayIdx) return s
          const newVariant: ShiftVariant = editHours === 'Day Off' ? 'off' : 'high'
          return { time: editHours, variant: newVariant } as Shift
        })
        return { ...e, shifts }
      })
    )
    showToast('Shift updated — remember to save draft')
    closeEdit()
  }

  const drawerTitle =
    editTarget != null
      ? `${employees[editTarget.empIdx].name} · ${DAYS_DISPLAY[editTarget.dayIdx]}`
      : ''

  return (
    <>
      {/* Two-column layout: schedule left, right panel fixed 320px */}
      <div className="grid gap-[18px] items-start" style={{ gridTemplateColumns: '1fr 320px' }}>
        {/* Left: schedule */}
        <div className="flex flex-col gap-[14px]">
          {/* Alert banner */}
          {!alertDismissed && (
            <div className="bg-danger-light border border-[#EAB8B3] rounded-[11px] px-4 py-3 flex items-start gap-[10px]">
              <span className="text-[15px] shrink-0 mt-px">🚨</span>
              <div className="text-[12.5px] text-danger leading-[1.5] flex-1">
                <strong className="font-semibold">Friday has a critical coverage gap:</strong> Jamie L. is the only staff member scheduled 11a–3p — your highest-traffic window. Pythia recommends adding Tara C. or Marcus R. to this shift.
              </div>
              <button
                onClick={() => setAlertDismissed(true)}
                className="text-[11.5px] font-semibold text-danger opacity-70 hover:opacity-100 whitespace-nowrap cursor-pointer border-0 bg-transparent font-sans"
              >
                Dismiss
              </button>
            </div>
          )}

          <StaffingSchedulePanel
            employees={employees}
            selectedShift={editTarget}
            onShiftClick={handleShiftClick}
          />
        </div>


        {/* Right: edit drawer (when open) + recommendations + team scores */}
        <div className="flex flex-col gap-[14px]">

          <StaffingRecommendations />

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
                {[
                  { label: 'Shift Hours', value: editHours, onChange: setEditHours, options: SHIFT_HOURS_OPTIONS },
                  { label: 'Station / Role', value: editStation, onChange: setEditStation, options: STATION_OPTIONS },
                  { label: 'Paired With', value: editPaired, onChange: setEditPaired, options: PAIRED_WITH_OPTIONS },
                ].map(({ label, value, onChange, options }) => (
                  <div key={label} className="flex flex-col gap-[5px]">
                    <div className="text-[10.5px] font-semibold text-muted uppercase tracking-[.08em]">{label}</div>
                    <select
                      className="w-full px-[10px] py-2 border border-border rounded-lg font-sans text-[13px] text-primary bg-surface cursor-pointer focus:outline-none focus:border-accent"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                    >
                      {options.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
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

          <StaffingTeamScores />
        </div>
      </div>

    </>
  )
}
