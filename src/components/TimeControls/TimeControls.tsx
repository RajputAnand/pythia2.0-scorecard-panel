'use client'

import { useState } from 'react'

const TIME_PERIODS = ['This Week', 'Month over Month', 'Quarter'] as const
const VIEW_OPTIONS = ['Actuals + Projected', 'Actuals Only', 'Projected Only'] as const

export default function TimeControls() {
  const [period, setPeriod] = useState<string>('Month over Month')
  const [view, setView] = useState<string>('Actuals + Projected')
  const [dateFrom, setDateFrom] = useState('2025-11-01')
  const [dateTo, setDateTo] = useState('2026-02-23')

  return (
    <div className="flex items-center gap-2 bg-surface border-b border-border px-[30px] h-[50px]">
      {TIME_PERIODS.map((p) => (
        <button
          key={p}
          className={`border rounded-lg font-sans font-medium cursor-pointer transition-all duration-150 text-[12px] px-[14px] py-[6px] ${
            period === p
              ? 'bg-accent text-white border-accent'
              : 'border-border text-secondary bg-transparent hover:border-accent hover:text-accent'
          }`}
          onClick={() => setPeriod(p)}
        >
          {p}
        </button>
      ))}

      <div className="bg-border shrink-0 w-px h-5 mx-1" />

      <div className="flex items-center gap-[6px] ml-1">
        <input
          type="date"
          className="border border-border rounded-[7px] font-mono text-secondary bg-surface cursor-pointer text-[11.5px] px-[10px] py-[5px] focus:outline-none focus:border-accent"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <span className="text-muted text-[11px]">to</span>
        <input
          type="date"
          className="border border-border rounded-[7px] font-mono text-secondary bg-surface cursor-pointer text-[11.5px] px-[10px] py-[5px] focus:outline-none focus:border-accent"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <button className="border border-border rounded-lg bg-transparent text-secondary font-sans font-medium cursor-pointer transition-all duration-150 text-[11.5px] px-[11px] py-[5px] hover:bg-surface-alt">
          Apply
        </button>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <span className="text-muted text-[11.5px]">View:</span>
        <div className="flex border border-border rounded-lg overflow-hidden">
          {VIEW_OPTIONS.map((v) => (
            <button
              key={v}
              className={`font-sans font-medium cursor-pointer transition-all duration-150 text-[11.5px] px-[12px] py-[5px] border-none ${
                view === v ? 'bg-primary text-white' : 'bg-transparent text-muted'
              }`}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
