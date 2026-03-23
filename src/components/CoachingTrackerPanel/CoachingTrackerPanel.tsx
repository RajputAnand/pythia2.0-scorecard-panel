'use client'

import { useState } from 'react'
import { EMPLOYEES } from '@/lib/coaching-tracker-data'
import CoachingEmpDrilldown from '@/components/CoachingEmpDrilldown/CoachingEmpDrilldown'

const badgeBgClass: Record<string, string> = {
  resolved: 'bg-accent',
  stalled: 'bg-danger',
  progress: 'bg-amber',
  good: 'bg-[#C8E6D6]',
}

export default function CoachingTrackerPanel() {
  const [activeId, setActiveId] = useState(EMPLOYEES[0].id)
  const activeEmployee = EMPLOYEES.find((e) => e.id === activeId)!

  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden flex flex-col">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-[22px] py-4 border-b border-border">
        <div>
          <div className="text-[14px] font-semibold">Issue → Coaching → Outcome</div>
          <div className="text-[11.5px] text-muted mt-0.5">Click an employee to see their full coaching history</div>
        </div>
        <span className="font-mono text-[11px] text-muted">5 employees · 25 total issues</span>
      </div>

      {/* Stalled Alert */}
      <div className="mx-[22px] mt-[14px] bg-danger-light border border-[#EAB8B3] rounded-[10px] px-[14px] py-[11px] flex items-center gap-[10px]">
        <span className="text-[16px] shrink-0">🚨</span>
        <div className="text-[12.5px] text-danger leading-[1.45] flex-1">
          <strong className="font-semibold">3 coaching issues have stalled (3+ weeks, no improvement).</strong>{' '}
          Jamie L., Sofia K., and Devon W. each have at least one issue the AI cannot move. Manager action required.
        </div>
        <span className="text-[11.5px] font-semibold text-danger cursor-pointer underline whitespace-nowrap">
          View all →
        </span>
      </div>

      {/* Employee Selector */}
      <div className="flex gap-2 px-[22px] py-[14px] border-b border-border overflow-x-auto">
        {EMPLOYEES.map((emp) => (
          <button
            key={emp.id}
            onClick={() => setActiveId(emp.id)}
            className={`flex items-center gap-2 px-[14px] py-[7px] rounded-[30px] border cursor-pointer transition-all duration-150 whitespace-nowrap select-none font-sans ${
              activeId === emp.id
                ? 'bg-primary border-primary'
                : 'bg-surface border-border hover:border-accent'
            }`}
          >
            <div
              className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
              style={{ background: emp.avatarColor }}
            >
              {emp.initials}
            </div>
            <span
              className={`text-[12.5px] font-medium ${
                activeId === emp.id ? 'text-white' : 'text-secondary'
              }`}
            >
              {emp.name}
            </span>
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${badgeBgClass[emp.badge]}`}
            />
          </button>
        ))}
      </div>

      {/* Active Employee Drilldown */}
      <CoachingEmpDrilldown employee={activeEmployee} />
    </div>
  )
}
