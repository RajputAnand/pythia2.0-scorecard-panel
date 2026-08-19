'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const TIME_PERIODS = ['This Week', 'Month over Month', 'Quarter'] as const
const VIEW_OPTIONS = ['Actuals + Projected', 'Actuals Only', 'Projected Only'] as const

export default function TimeControls() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const period = searchParams.get('period') || 'Month over Month'
  const view = searchParams.get('view') || 'Actuals + Projected'
  
  const initialDateFrom = searchParams.get('custom_start') || '2025-11-01'
  const initialDateTo = searchParams.get('custom_end') || '2026-02-23'

  const [dateFrom, setDateFrom] = useState(initialDateFrom)
  const [dateTo, setDateTo] = useState(initialDateTo)

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleApplyCustomDates = () => {
    updateParams({
      period: 'custom',
      custom_start: dateFrom,
      custom_end: dateTo,
    })
  }

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
          onClick={() => {
            updateParams({ period: p, custom_start: null, custom_end: null })
          }}
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
        <button 
          className={`border rounded-lg font-sans font-medium cursor-pointer transition-all duration-150 text-[11.5px] px-[11px] py-[5px] ${
            period === 'custom' 
              ? 'bg-accent text-white border-accent' 
              : 'border-border bg-transparent text-secondary hover:bg-surface-alt'
          }`}
          onClick={handleApplyCustomDates}
        >
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
              onClick={() => updateParams({ view: v })}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
